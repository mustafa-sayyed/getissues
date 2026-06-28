import { task } from "@renderinc/sdk/workflows";
import { db, eq, schema } from "../../lib/db.js";
import type { GitHubIssueSearchItem } from "../../types/github.types.js";
import { ensureRepoTask } from "./ensureRepo.task.js";

/**
 * Task: Deduplication Check
 *
 * Checks whether the given GitHub issue already exists in the database.
 * - If it exists -> logs and returns early (no further processing).
 * - If it doesn't exist -> passes the item downstream to `ensureRepoTask`.
 *
 * Responsibility: ONE — deduplicate issues.
 */
export const deduplicateIssueTask = task(
  { name: "deduplicateIssueTask", plan: "starter" },
  async (item: GitHubIssueSearchItem) => {
    const existingIssue = await db.query.issue.findFirst({
      where: eq(schema.issue.url, item.html_url),
    });

    if (existingIssue) {
      console.log(
        `Issue #${item.number} (${item.html_url}) already exists — skipping.`,
      );
      return {
        success: true,
        skipped: true,
        reason: "duplicate_issue",
        issueNumber: item.number,
        issueUrl: item.html_url,
      };
    }

    ensureRepoTask(item);

    return {
      success: true,
      message: `Issue #${item.number} is new and has passed to other tasks for further processing.`,
    };
  },
);
