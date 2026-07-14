import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
import { db, eq, schema } from "../../lib/db.js";
import type { GitHubIssueSearchItem } from "../../types/github.types.js";
import { ensureRepoTask } from "./ensureRepo.task.js";
import { inArray } from "drizzle-orm";

/**
 * Task: Deduplication Check
      logger.info(
        { existingIssues: existingIssues.length },
        `Issue #${existingIssues.length} already exists — skipping.`,
      );
 * Checks whether the given GitHub issue already exists in the database.
 * - If it exists -> logs and returns early (no further processing).
 * - If it doesn't exist -> passes the item downstream to `ensureRepoTask`.
 *
 * Responsibility: ONE — deduplicate issues.
 */
export const deduplicateIssueTask = task(
  { name: "deduplicateIssueTask", plan: "starter" },
  async (issues: GitHubIssueSearchItem[]) => {
    const issuesMap = new Map(issues.map((issue) => [issue.html_url, issue]));

    const existingIssues = await db.query.issue.findMany({
      where: inArray(schema.issue.url, issuesMap.keys().toArray()),
    });

    const existingIssuesMap = new Map(
      existingIssues.map((issue) => [issue.url, issue]),
    );

    const uniqueIssues = issuesMap
      .values()
      .filter((issue) => !existingIssuesMap.has(issue.html_url))
      .toArray();

    if (existingIssues.length && !uniqueIssues.length) {
      logger.info(
        { existingIssues: existingIssues.length },
        `Issue #${existingIssues.length} already exists — skipping.`,
      );
      return {
        success: true,
        skipped: true,
        reason: `Found ${existingIssues.length} existing issues in the database. No new issues to process.`,
        existingIssues: existingIssues.length,
      };
    }

    for (const item of uniqueIssues) {
      await ensureRepoTask(item);
    }

    return {
      success: true,
      existingIssues: existingIssues.length,
      newIssues: uniqueIssues.length,
      message: `Issue #${uniqueIssues.length} is new and has passed to other tasks for further processing.`,
    };
  },
);
