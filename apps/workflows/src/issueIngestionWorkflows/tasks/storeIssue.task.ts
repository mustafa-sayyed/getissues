import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
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

      logger.info(
        {
          issueId: item.id,
          issueTitle: item.title,
        },
        "Issue stored successfully",
      );

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
        logger.error(
          { error, issueId: item.id },
          "Duplicate issue, issue already exists in the DB",
        );
        return {
          success: false,
          error: "Duplicate issue, issue already exist in the DB",
        };
      }

      logger.error(
        { error, issueId: item.id, issueTitle: item.title },
        `Failed to store issue #${item.id} — "${item.title}":`,
      );

      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },
);
