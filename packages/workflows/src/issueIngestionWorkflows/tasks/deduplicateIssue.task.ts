import { task } from "@renderinc/sdk/workflows";
import { db, eq, schema } from "../../lib/db.js";
import type { GitHubIssueSearchItem } from "../../types/github.types.js";
import { ensureRepoTask } from "./ensureRepo.task.js";
import { inArray } from "drizzle-orm";

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
  async (issues: GitHubIssueSearchItem[]) => {
    const issuesUrl = issues.map((item) => item.html_url);

    const existingIssue = await db.query.issue.findMany({
      where: inArray(schema.issue.url, issuesUrl),
    });

    const uniqueIssue = issues.filter((issue) =>
      existingIssue.find((existing) => existing.url === issue.html_url),
    );

    if (existingIssue.length && !uniqueIssue.length) {
      console.log(`Issue #${existingIssue.length} already exists — skipping.`);
      return {
        success: true,
        skipped: true,
        reason: `Found ${existingIssue.length} existing issues in the database. No new issues to process.`,
        existingIssues: existingIssue.length,
      };
    }

    for (const item of uniqueIssue) {
      await ensureRepoTask(item);
    }

    return {
      success: true,
      existingIssues: existingIssue.length,
      newIssues: uniqueIssue.length,
      message: `Issue #${uniqueIssue.length} is new and has passed to other tasks for further processing.`,
    };
  },
);
