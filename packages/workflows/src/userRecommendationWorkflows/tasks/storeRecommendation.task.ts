import { task } from "@renderinc/sdk/workflows";
import { db, schema } from "../../lib/db.js";
import { issue } from "../../types/common.types.js";

/** Minimum match score required to store a recommendation. */
const SCORE_THRESHOLD = 0.7;

/**
 * Task: Persist a recommendation to the database (if score meets threshold).
 *
 * - If `matchScore` < 0.7 → skips the insert (issue is not a good enough match).
 * - If `matchScore` >= 0.7 → inserts a recommendation row.
 *
 * Responsibility: ONE — conditionally store a recommendation.
 */
export const storeRecommendationTask = task(
  { name: "storeRecommendationTask", plan: "starter" },
  async (
    userId: string,
    agentRunId: string,
    issue: issue,
    matchScore: number,
  ): Promise<void> => {
    if (matchScore < SCORE_THRESHOLD) {
      console.log(
        `Issue "${issue.title}" scored ${matchScore} — below threshold, skipping.`,
      );
      return;
    }

    await db.insert(schema.recommendations).values({
      userId,
      issueId: issue.id,
      agentRunId,
      reason: `Matched based on LLM evaluation score: ${matchScore.toFixed(2)}`,
      matchScore,
    });

    console.log(
      `Recommendation stored for issue "${issue.title}" (score: ${matchScore}).`,
    );

    return {
      success: true,
      issueTitle: issue.title,
      userId,
    };
  },
);
