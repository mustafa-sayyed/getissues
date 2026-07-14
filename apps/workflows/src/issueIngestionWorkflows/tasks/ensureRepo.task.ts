import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
import { db, schema, eq } from "../../lib/db.js";
import { getOctokit } from "../../lib/octokit.js";
import type {
  GitHubIssueSearchItem,
  RepoDetails,
  RepoIdentifier,
} from "../../types/github.types.js";
import { createIssueEmbeddingTask } from "./createEmbedding.task.js";

/**
 * Parses the `repository_url` field from a GitHub issue search item
 * into structured owner/repo identifiers.
 */
function parseRepoUrl(repositoryUrl: string): RepoIdentifier {
  const parts = repositoryUrl.split("/");
  const repo = parts.pop() ?? "";
  const owner = parts.pop() ?? "";
  return { owner, repo, githubRepoId: `${owner}/${repo}` };
}

/**
 * Task: Ensure the repository record exists in the DB.
 *
 * - Checks if the repo is already in `repo_analysis`.
 * - If NOT -> fetches repo metadata from GitHub and inserts it.
 * - If YES -> skips the fetch (no redundant GitHub API calls).
 * - Then forwards the issue item to `createIssueEmbeddingTask`.
 *
 * Responsibility: ONE — ensure repo exists in DB.
 */
export const ensureRepoTask = task(
  { name: "ensureRepoTask", plan: "starter" },
  async (item: GitHubIssueSearchItem) => {
    let repoDetails: RepoDetails = {
      name: "",
      description: null,
      languages: [],
      stars: 0,
    };
    const { owner, repo, githubRepoId } = parseRepoUrl(item.repository_url);

    const existingRepo = await db.query.repoAnalysis.findFirst({
      where: eq(schema.repoAnalysis.githubRepoId, githubRepoId),
    });

    if (existingRepo) {
      repoDetails = {
        name: existingRepo?.githubRepoId,
        description: existingRepo.description,
        languages: existingRepo.languages,
        stars: existingRepo.stars,
      };
    }

    if (!existingRepo) {
      const octokit = getOctokit();
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
      const { data: languagesData } = await octokit.rest.repos.listLanguages({
        owner,
        repo,
      });

      const languages = Object.keys(languagesData);

      await db
        .insert(schema.repoAnalysis)
        .values({
          githubRepoId,
          name: repoData.full_name,
          repoUrl: repoData.html_url,
          stars: repoData.stargazers_count,
          description: repoData.description ?? null,
          languages: languages,
        })
        .returning();

      repoDetails = {
        name: githubRepoId,
        description: repoData.description,
        languages: languages,
        stars: repoData.stargazers_count,
      };

      logger.info(
        { githubRepoId },
        `Repo ${githubRepoId} inserted into repo_analysis.`,
      );
    }

    createIssueEmbeddingTask(
      item,
      githubRepoId,
      repoDetails,
    );

    return {
      success: true,
      message: `Repo ${githubRepoId} ensured in DB and issue #${item.number} passed to embedding task.`,
    };
  },
);
