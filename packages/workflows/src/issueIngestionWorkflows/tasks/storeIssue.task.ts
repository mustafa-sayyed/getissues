import { task } from "@renderinc/sdk/workflows";
import { db, schema } from "../../lib/db.js";
import type { GitHubIssueSearchItem } from "../../types/github.types.js";

/**
 * Task: Persist a GitHub issue, its embedding into the database.
 *
 * Responsibility: ONE — store the issue in the DB.
 */
export const storeIssueTask = task(
  { name: "storeIssueTask" },
  async (item: GitHubIssueSearchItem, githubRepoId: string, embedding: number[]) => {
    await db.insert(schema.issue).values({
      githubRepoId,
      title: item.title,
      body: item.body ?? "",
      url: item.html_url,
      status: "open",
      embedding,
    });

    console.log(`Issue #${item.number} — "${item.title}" stored successfully.`);
  }
);
