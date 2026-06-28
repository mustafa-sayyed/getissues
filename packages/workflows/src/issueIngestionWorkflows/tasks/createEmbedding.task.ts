import { task } from "@renderinc/sdk/workflows";
import { getVoyageClient } from "../../lib/voyage.js";
import type {
  GitHubIssueSearchItem,
  RepoDetails,
} from "../../types/github.types.js";
import { storeIssueTask } from "./storeIssue.task.js";

/**
 * Task: Generate a vector embedding for a GitHub issue.
 *
 * - Concatenates issue details (title, body, repo name, descrption, languauges) into a single text blob.
 * - Sends it to VoyageAI `voyage-code-2` to produce a 1536-dim embedding.
 * - Passes the issue, githubRepoId, and embedding downstream to `storeIssueTask`.
 *
 * Responsibility: ONE — create the issue embedding via VoyageAI.
 */
export const createIssueEmbeddingTask = task(
  { name: "createIssueEmbeddingTask", plan: "starter"},
  async (
    item: GitHubIssueSearchItem,
    githubRepoId: string,
    repo: RepoDetails,
  ) => {
    const voyage = getVoyageClient();

    const textToEmbed =
      `${item.title}\n\n${item.body ?? ""} \n\n ${repo.name} ${repo.description} \n ${repo.languages}`.trim();

    try {
      const embedRes = await voyage.embed({
        input: [textToEmbed],
        model: "voyage-code-2",
      });
      const embedding: number[] = embedRes.data?.[0]?.embedding ?? [];

      if (embedding.length === 0) {
        console.warn(
          `VoyageAI returned an empty embedding for issue #${item.number}. Skipping store.`,
        );
        return {
          success: true,
          skipped: true,
          reason: "empty_embedding",
          issueNumber: item.number,
        };
      }

      storeIssueTask(item, githubRepoId, embedding);

      return {
        success: true,
        message: `Embedding created and issue #${item.number} stored successfully.`,
      };
    } catch (error) {
      console.log(
        "[Voyage AI]: An error occured while creating embeddings",
        error,
      );
      throw error;
    }
  },
);
