import { WorkflowLogger as logger } from "@packages/logging";
import { discoverReposTask } from "./discoverRepos.js";
import { fetchRepoIssuesTask } from "./fetchRepoIssues.js";

const DEFAULT_REPO_LIMIT = 5;
const DEFAULT_ISSUES_PER_REPO = 10;

export const ingestRepoIssuesTask = async (
  repoLimit = DEFAULT_REPO_LIMIT,
  issuesPerRepo = DEFAULT_ISSUES_PER_REPO,
) => {
  const repos = await discoverReposTask(repoLimit);
  let totalIssues = 0;

  for (const repo of repos) {
    try {
      const issues = await fetchRepoIssuesTask(repo, issuesPerRepo);
      totalIssues += issues.length;
    } catch (error) {
      logger.error(
        { error, repo: repo.full_name },
        "Failed to ingest issues from discovered repository.",
      );
    }
  }

  logger.info(
    { repos: repos.length, totalIssues },
    "Repo-based issue ingestion completed.",
  );

  return {
    success: true,
    repos: repos.length,
    issues: totalIssues,
  };
};
