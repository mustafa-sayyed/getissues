import { task } from "@renderinc/sdk/workflows";
import { db, schema, sql } from "../../lib/db.js";
import { issue } from "../../types/common.types.js";

/**
 * Task: Semantic similarity search over stored issues.
 *
 * Uses pgvector cosine distance (`<=>`) to find the top-10 most similar
 * issues to the provided user embedding.
 *
 * Responsibility: ONE — run the pgvector similarity search.
 */
export const semanticSearchIssuesTask = task(
  { name: "semanticSearchIssuesTask" },
  async (userEmbedding: number[]): Promise<issue[]> => {
    const embeddingStr = `[${userEmbedding.join(",")}]`;

    const matchedIssues = await db
      .select()
      .from(schema.issue)
      .orderBy(sql`${schema.issue.embedding} <=> ${embeddingStr}`)
      .limit(10);

    console.log(`Semantic search found ${matchedIssues.length} candidate issues.`);
    return matchedIssues;
  }
);
