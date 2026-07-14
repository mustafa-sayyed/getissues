import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
import { db, eq, schema, sql } from "../../lib/db.js";
import { issue } from "../../types/common.types.js";
import { and, notInArray } from "drizzle-orm";

/**
 * Task: Semantic similarity search over stored issues.
 *
 * Uses pgvector cosine distance (`<=>`) to find the top-10 most similar
 * issues to the provided user embedding.
 *
 * Responsibility: ONE — run the pgvector similarity search.
 */
export const semanticSearchIssuesTask = task(
  { name: "semanticSearchIssuesTask", plan: "starter" },
  async (userEmbedding: number[], userId: string): Promise<issue[]> => {
    const embeddingStr = `[${userEmbedding.join(",")}]`;

    const recommendedIssues = await db
      .select()
      .from(schema.recommendations)
      .where(eq(schema.recommendations.userId, userId));

    const alreadyEvaluatedIssues = await db
      .select()
      .from(schema.agentIssueEvaluation)
      .where(eq(schema.agentIssueEvaluation.userId, userId));

    const matchedIssues = await db
      .select()
      .from(schema.issue)
      .where(
        and(
          notInArray(
            schema.issue.id,
            recommendedIssues.map((rec) => rec.issueId),
          ),
          notInArray(
            schema.issue.id,
            alreadyEvaluatedIssues.map((agentEval) => agentEval.issueId),
          ),
        ),
      )
      .orderBy(sql`${schema.issue.embedding} <=> ${embeddingStr}`)
      .limit(20);

    logger.info(
      { candidateIssues: matchedIssues.length, userId },
      `Semantic search found ${matchedIssues.length} candidate issues.`,
    );
    return matchedIssues;
  },
);
