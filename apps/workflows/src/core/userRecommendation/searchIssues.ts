import { WorkflowLogger as logger } from "@packages/logging";
import { db, eq, schema, sql } from "../../lib/db.js";
import { issue } from "../../types/common.types.js";
import { and, isNotNull, notInArray } from "drizzle-orm";

/**
 * Task: Semantic similarity search over stored issues.
 *
 * Uses pgvector cosine distance (`<=>`) to find the top-10 most similar
 * issues to the provided user embedding.
 *
 * Responsibility: ONE — run the pgvector similarity search.
 */
export const semanticSearchIssuesTask = async (
  userEmbedding: number[],
  userId: string,
  blockedRepoIds: string[] = [],
): Promise<issue[]> => {
  const embeddingStr = `[${userEmbedding.join(",")}]`;

  const recommendedIssues = await db
    .select()
    .from(schema.recommendations)
    .where(eq(schema.recommendations.userId, userId));

  const alreadyEvaluatedIssues = await db
    .select()
    .from(schema.agentIssueEvaluation)
    .where(eq(schema.agentIssueEvaluation.userId, userId));

  const filters = [
    eq(schema.issue.status, "open"),
    eq(schema.issue.isAssigned, false),
    eq(schema.issue.isActive, true),
    isNotNull(schema.issue.embedding),
    notInArray(
      schema.issue.id,
      recommendedIssues.map((rec) => rec.issueId),
    ),
    notInArray(
      schema.issue.id,
      alreadyEvaluatedIssues.map((agentEval) => agentEval.issueId),
    ),
  ];

  // Hard exclusion: never surface repos the user keeps rejecting.
  if (blockedRepoIds.length > 0) {
    filters.push(notInArray(schema.issue.githubRepoId, blockedRepoIds));
  }

  const matchedIssues = await db
    .select()
    .from(schema.issue)
    .where(and(...filters))
    .orderBy(sql`${schema.issue.embedding} <=> ${embeddingStr}`)
    .limit(20);

  logger.info(
    { candidateIssues: matchedIssues.length, userId },
    `Semantic search found ${matchedIssues.length} candidate issues.`,
  );
  return matchedIssues;
};
