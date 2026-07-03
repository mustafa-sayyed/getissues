// storeRecommendation.task.ts
import { schema } from "@packages/db";
import { task } from "@renderinc/sdk/workflows";
import { db } from "../../lib/db.js";
import { IssueEvaluation } from "../../types/common.types.js";

const SCORE_THRESHOLD = 0.5;

export const storeRecommendationTask = task(
  { name: "storeRecommendationTask", plan: "starter" },
  async (
    userId: string,
    agentRunId: string,
    evaluations: IssueEvaluation[]
  ) => {
    const toRecommend = evaluations.filter(e => e.score >= SCORE_THRESHOLD);
    const toEvaluate = evaluations.filter(e => e.score < SCORE_THRESHOLD);

    // Bulk insert recommendations in one DB call
    if (toRecommend.length > 0) {
      await db.insert(schema.recommendations).values(
        toRecommend.map(e => ({
          userId,
          issueId: e.issueId,
          agentRunId,
          matchScore: e.score,
        }))
      );
      console.log(`Stored ${toRecommend.length} recommendations`);
    }

    // Bulk insert below-threshold evaluations in one DB call
    if (toEvaluate.length > 0) {
      await db.insert(schema.agentIssueEvaluation).values(
        toEvaluate.map(e => ({
          agentId: agentRunId,
          issueId: e.issueId,
          userId,
          matchScore: e.score,
          reason: e.reason,
        }))
      );
      console.log(`Stored ${toEvaluate.length} below-threshold evaluations`);
    }

    return {
      success: true,
      recommended: toRecommend.length,
      belowThreshold: toEvaluate.length,
    };
  }
);