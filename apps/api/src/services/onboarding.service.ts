import type { Octokit } from "octokit";
import { ApiLogger as logger } from "@packages/shared";
import {
  EXISTENCE_PATHS,
  EXISTENCE_SKILLS,
  MANIFEST_PARSERS,
  MANIFEST_PATHS,
  MAX_DETECTED_SKILLS,
  MAX_MANIFEST_REPOS,
  TOPIC_LANGUAGES,
  countSkill,
  normalizeLanguage,
  rankSkills,
  toEcosystemSkill,
  type SkillCounts,
} from "../utils/skillsDetection.ts";
import type { OnboardingProfilePayload } from "../types/onboarding.ts";

export const getFileText = async (
  octokit: Octokit,
  owner: string,
  name: string,
  path: string,
): Promise<string | null> => {
  try {
    const file = await octokit.rest.repos.getContent({
      owner,
      repo: name,
      path,
    });
    if (Array.isArray(file.data) || file.data.type !== "file") {
      return null;
    }
    return Buffer.from(file.data.content, "base64").toString("utf-8");
  } catch {
    // A missing file is the common case, not an error.
    return null;
  }
};

export const pathExists = async (
  octokit: Octokit,
  owner: string,
  name: string,
  path: string,
): Promise<boolean> => {
  try {
    await octokit.rest.repos.getContent({ owner, repo: name, path });
    return true;
  } catch {
    return false;
  }
};

/**
 * Aggregate a GitHub user's onboarding profile: identity, repo stats,
 * and detected skills from primary languages, repo topics, dependency
 * manifests, and tool marker files. One vote per skill per repo.
 */
const fetchOnboardingProfile = async (
  octokit: Octokit,
): Promise<OnboardingProfilePayload> => {
  const [profile, repos] = await Promise.all([
    octokit.rest.users.getAuthenticated(),
    octokit.rest.repos.listForAuthenticatedUser({
      sort: "pushed",
      per_page: 30,
    }),
  ]);

  const counts: SkillCounts = new Map<string, number>();
  for (const repo of repos.data) {
    const seen = new Set<string>();
    if (repo.language) {
      countSkill(counts, seen, normalizeLanguage(repo.language));
    }
    // Repo topics are free (already in the payload) and often name
    // frameworks — e.g. "react", "nextjs", "tailwind-css".
    for (const topic of repo.topics ?? []) {
      const compact = topic.replace(/-/g, "");
      const skill =
        toEcosystemSkill(topic) ??
        toEcosystemSkill(compact) ??
        (TOPIC_LANGUAGES.has(topic.toLowerCase())
          ? normalizeLanguage(topic)
          : null);
      if (skill) {
        countSkill(counts, seen, skill);
      }
    }
  }

  // Frameworks never appear in GitHub's primary `language` field, so read
  // them from dependency files in the top repos. Bounded and
  // failure-tolerant.
  const manifestRepos = repos.data
    .filter((repo) => !repo.fork && !repo.archived)
    .slice(0, MAX_MANIFEST_REPOS);

  const seenByRepo = new Map<string, Set<string>>();
  const getSeen = (repoKey: string): Set<string> => {
    let seen = seenByRepo.get(repoKey);
    if (!seen) {
      seen = new Set<string>();
      seenByRepo.set(repoKey, seen);
    }
    return seen;
  };

  // reads dependency manifests (package.json, requirements.txt, go.mod, etc.) in parallel
  const manifestResults = await Promise.allSettled(
    manifestRepos.flatMap((repo) =>
      MANIFEST_PATHS.map(async (path) => {
        try {
          const text = await getFileText(
            octokit,
            repo.owner.login,
            repo.name,
            path,
          );
          if (text === null) {
            return null;
          }
          return { owner: repo.owner.login, name: repo.name, path, text };
        } catch (error) {
          logger.error(
            { error, owner: repo.owner.login, name: repo.name, path },
            "Failed to read manifest file",
          );
          return null;
        }
      }),
    ),
  );

  // Parse dependency manifests and count skills.
  for (const result of manifestResults) {
    if (result.status !== "fulfilled" || !result.value) {
      continue;
    }
    const { owner, name, path, text } = result.value;
    const parse = MANIFEST_PARSERS[path];
    if (!parse) {
      continue;
    }
    for (const dep of parse(text)) {
      const skill = toEcosystemSkill(dep);
      if (skill) {
        countSkill(counts, getSeen(`${owner}/${name}`), skill);
      }
    }
  }
  // Check the file paths (e.g. Dockerfile, Makefile, etc.)
  // to Count the skills that are indicated by the existence of files.
  const existenceResults = await Promise.allSettled(
    manifestRepos.flatMap((repo) =>
      EXISTENCE_PATHS.map(async (path) => {
        try {
          const exists = await pathExists(
            octokit,
            repo.owner.login,
            repo.name,
            path,
          );
          return exists
            ? { owner: repo.owner.login, name: repo.name, path }
            : null;
        } catch (error) {
          logger.error(
            { error, owner: repo.owner.login, name: repo.name, path },
            "Failed to check existence of file",
          );
          return null;
        }
      }),
    ),
  );

  // Count skills that are indicated by the existence of files.
  for (const result of existenceResults) {
    if (result.status !== "fulfilled" || !result.value) {
      continue;
    }
    const { owner, name, path } = result.value;
    const skill = EXISTENCE_SKILLS[path];
    if (skill) {
      countSkill(counts, getSeen(`${owner}/${name}`), skill);
    }
  }

  // Rank the top repos based on star count and return the top 3 with their primary language.
  const topRepos = [...repos.data]
    .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
    .slice(0, 3)
    .map((repo) => ({
      name: repo.full_name,
      stars: repo.stargazers_count ?? 0,
      language: repo.language ? normalizeLanguage(repo.language) : null,
    }));

  // Count the total number of pull requests authored by the user.
  let totalPRs = 0;
  try {
    const pulls = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${profile.data.login} is:pr`,
      per_page: 1,
    });
    totalPRs = pulls.data.total_count ?? 0;
  } catch (error) {
    logger.error({ error }, "Failed to fetch PR count for onboarding profile");
  }

  return {
    login: profile.data.login,
    name: profile.data.name,
    avatarUrl: profile.data.avatar_url,
    publicRepos: profile.data.public_repos,
    totalPRs,
    detectedLanguages: rankSkills(counts, MAX_DETECTED_SKILLS),
    topRepos,
  };
};

export { fetchOnboardingProfile };
