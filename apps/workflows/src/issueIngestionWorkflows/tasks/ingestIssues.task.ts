import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
import { getOctokit } from "../../lib/octokit.js";
import { deduplicateIssueTask } from "./deduplicateIssue.task.js";
import { SEARCH_QUERIES } from "../../lib/githubSearchQueries.js";
import { ingestRepoIssuesTask } from "./ingestRepoIssues.task.js";

/**
 * Workflow: Issue Ingestion Entry Point.
 *
 * Responsibility: ONE — fetch issues from GitHub and fan out.
 */
export const ingestIssuesWorkflow = task(
  { name: "ingestIssuesWorkflow", plan: "starter" },
  async () => {
    logger.info("Starting issue ingestion workflow...");
    const octokit = getOctokit();
    let totalIssuesIngested = 0;
    for (const searchQuery of SEARCH_QUERIES) {
      const searchRes = await octokit.rest.search.issuesAndPullRequests({
        q: searchQuery.query,
        per_page: searchQuery.limit,
      });

      const issues = searchRes.data.items;
      totalIssuesIngested += issues.length;

      logger.info(
        {
          issueCount: issues.length,
          query: searchQuery.query,
        },
        "Dispatching deduplication tasks",
      );

      deduplicateIssueTask(issues);
    }

    const repoIngestionResult = await ingestRepoIssuesTask();

    logger.info("Issue ingestion tasks dispatched.");

    return {
      success: true,
      labelBasedIssues: totalIssuesIngested,
      repoBasedIssues: repoIngestionResult.issues,
      discoveredRepos: repoIngestionResult.repos,
      message: `Ingested ${totalIssuesIngested} label-based issues and ${repoIngestionResult.issues} repo-based issues.`,
    };
  },
);
