import type { Octokit } from "octokit";
import { ApiLogger as logger } from "@packages/shared";
import {
  EXISTENCE_PATHS,
  EXISTENCE_SKILLS,
  MANIFEST_PATHS,
  MAX_DETECTED_SKILLS,
  MAX_MANIFEST_REPOS,
  TOPIC_LANGUAGES,
  countSkill,
  findSkillFilesInTree,
  normalizeLanguage,
  parseManifestFile,
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

type ScanTarget = {
  owner: string;
  name: string;
  branch: string;
};

/** Full file list via the recursive git tree. Null when unavailable or truncated. */
const getTreePaths = async (
  octokit: Octokit,
  target: ScanTarget,
): Promise<string[] | null> => {
  try {
    const { data } = await octokit.rest.git.getTree({
      owner: target.owner,
      repo: target.name,
      tree_sha: target.branch,
      recursive: "1",
    });
    if (data.truncated) {
      return null;
    }
    return (data.tree ?? [])
      .filter((entry) => entry.type === "blob" && entry.path)
      .map((entry) => entry.path as string);
  } catch {
    return null;
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

  // Manifest scan: frameworks, libraries, and tools that never appear in GitHub's primary `language`
  // field, so read them from dependency files. 
  // Tree-first: one recursive listing finds manifests at any depth (monorepos included);
  // root-only probing is the fallback for truncated/failed trees. 
  // Bounded and failure-tolerant throughout.
  
  const manifestRepos: ScanTarget[] = repos.data
    .filter((repo) => !repo.fork && !repo.archived)
    .slice(0, MAX_MANIFEST_REPOS)
    .map((repo) => ({
      owner: repo.owner.login,
      name: repo.name,
      branch: repo.default_branch ?? "main",
    }));

  const seenByRepo = new Map<string, Set<string>>();
  const getSeen = (repoKey: string): Set<string> => {
    let seen = seenByRepo.get(repoKey);
    if (!seen) {
      seen = new Set<string>();
      seenByRepo.set(repoKey, seen);
    }
    return seen;
  };

  const countDeps = (
    repoKey: string,
    path: string,
    text: string | null,
  ): void => {
    if (!text) {
      return;
    }
    for (const dep of parseManifestFile(path, text)) {
      const skill = toEcosystemSkill(dep);
      if (skill) {
        countSkill(counts, getSeen(repoKey), skill);
      }
    }
  };

  const scanRepoFromTree = async (
    target: ScanTarget,
    tree: string[],
  ): Promise<void> => {
    const repoKey = `${target.owner}/${target.name}`;
    const seen = getSeen(repoKey);
    const { manifests, markers } = findSkillFilesInTree(tree);
    // Markers are proven present by the tree itself — no fetch needed.
    for (const marker of markers) {
      const skill = EXISTENCE_SKILLS[marker];
      if (skill) {
        countSkill(counts, seen, skill);
      }
    }
    const results = await Promise.allSettled(
      manifests.map(async (path) => ({
        path,
        text: await getFileText(octokit, target.owner, target.name, path),
      })),
    );
    for (const result of results) {
      if (result.status !== "fulfilled") {
        continue;
      }
      countDeps(repoKey, result.value.path, result.value.text);
    }
  };

  const scanRepoFromRoot = async (target: ScanTarget): Promise<void> => {
    const repoKey = `${target.owner}/${target.name}`;
    const seen = getSeen(repoKey);

    // Reads Root manifests, markers files
    const rootTexts = await Promise.allSettled(
      MANIFEST_PATHS.map(async (path) => ({
        path,
        text: await getFileText(octokit, target.owner, target.name, path),
      })),
    );
    
    for (const result of rootTexts) {
      if (result.status !== "fulfilled") {
        continue;
      }
      countDeps(repoKey, result.value.path, result.value.text);
    }

    const rootExists = await Promise.allSettled(
      EXISTENCE_PATHS.map(async (path) => ({
        path,
        exists: await pathExists(octokit, target.owner, target.name, path),
      })),
    );
    
    for (const result of rootExists) {
      if (result.status !== "fulfilled" || !result.value.exists) {
        continue;
      }
      const skill = EXISTENCE_SKILLS[result.value.path];
      if (skill) {
        countSkill(counts, seen, skill);
      }
    }
  };

  const scanRepo = async (target: ScanTarget): Promise<void> => {
    const tree = await getTreePaths(octokit, target);
    if (tree) {
      await scanRepoFromTree(target, tree);
      return;
    }
    await scanRepoFromRoot(target);
  };

  await Promise.allSettled(manifestRepos.map((repo) => scanRepo(repo)));

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
