import { WorkflowLogger as logger } from "@packages/logging";
import type {
  GitHubIssueSearchItem,
  RepoDetails,
} from "../../types/github.types.js";
import { getEmbeddings } from "../../lib/embeddings.js";

/**
 * Task: Generate a vector embedding for a GitHub issue.
 *
 * - Concatenates issue details (title, body, repo name, descrption, languauges) into a single text blob.
 * - Sends it to VoyageAI `voyage-code-2` to produce a 1536-dim embedding.
 * - Returns the embedding for downstream orchestration.
 *
 * Responsibility: ONE — create the issue embedding via VoyageAI.
 */
export const createIssueEmbeddingTask = async (
  item: GitHubIssueSearchItem,
  githubRepoId: string,
  repo: RepoDetails,
) => {
  const textToEmbed =
    `${item.title}\n\n${item.body ?? ""} \n\n ${repo.name} ${repo.description} \n ${repo.languages}`.trim();

  try {
    const embedRes = await getEmbeddings(textToEmbed);
    const embedding: number[] = embedRes.embeddings;

    if (embedding.length === 0) {
      logger.warn(
        { issueNumber: item.number },
        `Empty embedding for issue #${item.number}. Skipping store.`,
      );
      return {
        success: false,
        message: "Failed to generate embedding for issue.",
        embedding: null,
      };
    }

    return {
      success: true,
      message: `Embedding created for issue #${item.number}.`,
      embedding,
    };
  } catch (error) {
    logger.error(
      { error, issueNumber: item.number },
      "[Voyage AI]: An error occured while creating embeddings",
    );
    throw error;
  }
};
