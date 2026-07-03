import { task } from "@renderinc/sdk/workflows";
import { getOctokit } from "../../lib/octokit.js";
import { deduplicateIssueTask } from "./deduplicateIssue.task.js";
import { SEARCH_QUERIES } from "../../lib/githubSearchQueries.js";

/**
 * Workflow: Issue Ingestion Entry Point.
 *
 * Responsibility: ONE — fetch issues from GitHub and fan out.
 */
export const ingestIssuesWorkflow = task(
  { name: "ingestIssuesWorkflow", plan: "starter" },
  async () => {
    console.log("Starting issue ingestion workflow...");
    const octokit = getOctokit();
    let issues = null;
    for (const searchQuery of SEARCH_QUERIES) {
      const searchRes = await octokit.rest.search.issuesAndPullRequests({
        q: searchQuery.query,
        per_page: searchQuery.limit,
      });

      issues = searchRes.data.items;

      console.log(
        `Found ${issues.length} issues for ${searchQuery.query}. Dispatching deduplication tasks...`,
      );

      deduplicateIssueTask(issues);
    }

    console.log("Issue ingestion tasks dispatched.");

    return {
      success: true,
      message: `Ingested ${issues?.length} issues and dispatched deduplication tasks.`,
    };
  },
);
