import { schema } from "@packages/db";
import { WorkflowLogger as logger } from "@packages/logging";
import { db } from "../../lib/db.js";
import { IssueEvaluation } from "../../types/common.types.js";

const SCORE_THRESHOLD = 0.5;

export const storeRecommendationTask = async (
  userId: string,
  agentRunId: string,
  evaluations: IssueEvaluation[],
  maxToStore?: number,
) => {
  let toRecommend = evaluations.filter((e) => e.score >= SCORE_THRESHOLD);
  const toEvaluate = evaluations.filter((e) => e.score < SCORE_THRESHOLD);

  // Enforce the pending-backlog / quota allowance for this run.
  // Anything above the allowance is dropped, never stored.
  const skippedByCap =
    maxToStore === undefined
      ? 0
      : Math.max(0, toRecommend.length - Math.max(0, maxToStore));
  if (maxToStore !== undefined) {
    toRecommend = toRecommend.slice(0, Math.max(0, maxToStore));
  }

  // Bulk insert recommendations in one DB call
  if (toRecommend.length > 0) {
    await db.insert(schema.recommendations).values(
      toRecommend.map((e) => ({
        userId,
        issueId: e.issueId,
        agentRunId,
        matchScore: e.score,
        reason: e.reason,
      })),
    );
    logger.info(
      { stored: toRecommend.length },
      `Stored ${toRecommend.length} recommendations`,
    );
  }

  // Bulk insert below-threshold evaluations in one DB call
  if (toEvaluate.length > 0) {
    await db.insert(schema.agentIssueEvaluation).values(
      toEvaluate.map((e) => ({
        agentId: agentRunId,
        issueId: e.issueId,
        userId,
        matchScore: e.score,
        reason: e.reason,
      })),
    );
    logger.info(
      { stored: toEvaluate.length },
      `Stored ${toEvaluate.length} below-threshold evaluations`,
    );
  }

  return {
    success: true,
    recommended: toRecommend.length,
    belowThreshold: toEvaluate.length,
    skippedByCap,
  };
};
