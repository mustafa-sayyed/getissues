import { task } from "@renderinc/sdk/workflows";
import { db, schema } from "../../lib/db.js";
import type { GitHubIssueSearchItem } from "../../types/github.types.js";
import { NeonDbError } from "@neondatabase/serverless";

/**
 * Task: Persist a GitHub issue, its embedding into the database.
 *
 * Responsibility: ONE — store the issue in the DB.
 */
export const storeIssueTask = task(
  { name: "storeIssueTask", plan: "starter" },
  async (
    item: GitHubIssueSearchItem,
    githubRepoId: string,
    embedding: number[],
  ) => {
    try {
      await db.insert(schema.issue).values({
        githubRepoId,
        githubId: item.id,
        title: item.title,
        body: item.body ?? "",
        url: item.html_url,
        status: "open",
        embedding,
      });

      console.log(`Issue #${item.id} — "${item.title}" stored successfully.`);

      return {
        success: true,
        issueId: item.id,
        issueTitle: item.title,
        issueUrl: item.html_url,
      };
    } catch (error) {
      if (
        error instanceof NeonDbError &&
        (error.code === "23505" || error?.constraint === "issue_url_unique")
      ) {
        console.log("Duplicate issue, issue already exist in the DB", error);
        return {
          success: false,
          error: "Duplicate issue, issue already exist in the DB",
        };
      }

      console.error(
        `Failed to store issue #${item.id} — "${item.title}":`,
        error,
      );

      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },
);
