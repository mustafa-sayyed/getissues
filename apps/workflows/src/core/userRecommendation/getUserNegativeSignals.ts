import { and, desc, eq, gte, or, sql } from "drizzle-orm";
import { WorkflowLogger as logger } from "@packages/logging";
import { db, schema } from "../../lib/db.js";

// A repo is blocked once the user rejects this many of its issues.
export const BLOCKED_REPO_DISMISSALS = 2;
// Only rejections inside this window count (days).
export const NEGATIVE_SIGNAL_DAYS = 30;
// Max rejections injected into the scoring prompt.
export const NEGATIVE_SIGNAL_LIMIT = 15;

const negativeCutoff = () =>
  new Date(Date.now() - NEGATIVE_SIGNAL_DAYS * 24 * 60 * 60 * 1000);

/**
 * Task: Find repos the user keeps rejecting.
 *
 * A rejection is a recommendation the user marked not interested or not_helpful.
 * Returns the `githubRepoId`s of repos with >= BLOCKED_REPO_DISMISSALS
 * rejections inside the negative-signal window.
 *
 * Responsibility: ONE — compute the repo blocklist, never write.
 */
export const getBlockedRepoIdsTask = async (
  userId: string,
): Promise<string[]> => {
  const rows = await db
    .select({
      githubRepoId: schema.issue.githubRepoId,
      rejections: sql<number>`count(*)`.mapWith(Number),
    })
    .from(schema.recommendations)
    .innerJoin(
      schema.issue,
      eq(schema.recommendations.issueId, schema.issue.id),
    )
    .where(
      and(
        eq(schema.recommendations.userId, userId),
        or(
          eq(schema.recommendations.status, "notinterested"),
          eq(schema.recommendations.feedback, "not_helpful"),
        ),
        gte(schema.recommendations.recommendedAt, negativeCutoff()),
      ),
    )
    .groupBy(schema.issue.githubRepoId)
    .having(sql`count(*) >= ${BLOCKED_REPO_DISMISSALS}`);

  const blocked = rows.map((r) => r.githubRepoId);

  logger.info(
    { userId, blockedRepoCount: blocked.length },
    `Found ${blocked.length} blocked repos for user ${userId}.`,
  );

  return blocked;
};

/**
 * Task: Build the "things this user rejected" context for the scoring prompt.
 *
 * Returns a compact text block of recent rejections (issue title, repo,
 * dismiss reason) so the scoring agent can penalize similar issues.
 *
 * Responsibility: ONE — read negative signals, never write.
 */
export const getNegativeSignalsTextTask = async (
  userId: string,
): Promise<string> => {
  const rows = await db
    .select({
      issueTitle: schema.issue.title,
      repoName: schema.repoAnalysis.name,
      dismissReason: schema.recommendations.dismissReason,
      feedback: schema.recommendations.feedback,
    })
    .from(schema.recommendations)
    .innerJoin(
      schema.issue,
      eq(schema.recommendations.issueId, schema.issue.id),
    )
    .leftJoin(
      schema.repoAnalysis,
      eq(schema.issue.githubRepoId, schema.repoAnalysis.githubRepoId),
    )
    .where(
      and(
        eq(schema.recommendations.userId, userId),
        or(
          eq(schema.recommendations.status, "notinterested"),
          eq(schema.recommendations.feedback, "not_helpful"),
        ),
        gte(schema.recommendations.recommendedAt, negativeCutoff()),
      ),
    )
    .orderBy(desc(schema.recommendations.recommendedAt))
    .limit(NEGATIVE_SIGNAL_LIMIT);

  if (rows.length === 0) {
    return "";
  }

  const lines = rows.map((r, idx) => {
    const reason = r.dismissReason
      ? ` (reason: ${r.dismissReason})`
      : r.feedback === "not_helpful"
        ? " (marked not helpful)"
        : "";
    return `${idx + 1}. "${r.issueTitle}" in repo ${r.repoName ?? "unknown"}, reason for rejecting issue: ${reason}`;
  });

  logger.info(
    { userId, negativeCount: rows.length },
    `Loaded ${rows.length} negative signals for user ${userId}.`,
  );

  return `Issues the user recently rejected — penalize issues that resemble these:\n${lines.join("\n")}`;
};
