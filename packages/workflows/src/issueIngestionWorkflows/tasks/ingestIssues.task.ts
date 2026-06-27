import { task } from "@renderinc/sdk/workflows";
import { getOctokit } from "../../lib/octokit.js";
import { deduplicateIssueTask } from "./deduplicateIssue.task.js";

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
    const searchRes = await octokit.rest.search.issuesAndPullRequests({
      q: 'is:issue is:open label:"good first issue" no:assignee',
      per_page: 60,
    });

    const issues = searchRes.data.items;
    console.log(
      `Found ${issues.length} issues. Dispatching deduplication tasks...`,
    );

    for (const item of issues) {
      await deduplicateIssueTask(item);
    }

    console.log("Issue ingestion tasks dispatched.");
  },
);
