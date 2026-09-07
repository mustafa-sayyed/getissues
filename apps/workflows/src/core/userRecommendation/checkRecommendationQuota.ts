import { and, eq } from "drizzle-orm";
import { WorkflowLogger as logger } from "@packages/logging";
import { db, schema, sql } from "../../lib/db.js";

/**
 * Number of days each quota window covers.
 * Matches the `recommendation_quota_window` enum on the user table.
 */
export const QUOTA_WINDOW_DAYS = {
  day: 1,
  week: 7,
  month: 30,
} as const;

export type QuotaWindow = keyof typeof QUOTA_WINDOW_DAYS;

export interface RecommendationQuotaUsage {
  pending: number;
  quotaUsed: number;
  maxPending: number;
  quotaLimit: number;
  quotaWindow: QuotaWindow;
  remainingPending: number;
  remainingQuota: number;
  canRecommend: boolean;
}

/**
 * Task: Read a user's recommendation quota usage.
 *
 * Counts:
 * - `pending`: recommendations the user has not seen yet (status = notviewed).
 * - `quotaUsed`: recommendations created inside the user's quota window.
 *
 * Responsibility: ONE — read quota state, never write.
 */
export const getRecommendationQuotaUsageTask = async (
  userId: string,
): Promise<RecommendationQuotaUsage> => {
  const [settings] = await db
    .select({
      maxPending: schema.user.maxPendingRecommendations,
      quotaLimit: schema.user.recommendationQuotaLimit,
      quotaWindow: schema.user.recommendationQuotaWindow,
    })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .limit(1);

  const maxPending = settings?.maxPending ?? 15;
  const quotaLimit = settings?.quotaLimit ?? 5;
  const quotaWindow: QuotaWindow = settings?.quotaWindow ?? "day";

  const windowStart = new Date(
    Date.now() - QUOTA_WINDOW_DAYS[quotaWindow] * 24 * 60 * 60 * 1000,
  );

  const [counts] = await db
    .select({
      pending:
        sql<number>`count(*) filter (where ${schema.recommendations.status} = 'notviewed')`.mapWith(
          Number,
        ),
      quotaUsed:
        sql<number>`count(*) filter (where ${schema.recommendations.recommendedAt} >= ${windowStart})`.mapWith(
          Number,
        ),
    })
    .from(schema.recommendations)
    .where(eq(schema.recommendations.userId, userId));

  const pending = counts?.pending ?? 0;
  const quotaUsed = counts?.quotaUsed ?? 0;
  const remainingPending = Math.max(0, maxPending - pending);
  const remainingQuota = Math.max(0, quotaLimit - quotaUsed);
  const canRecommend = remainingPending > 0 && remainingQuota > 0;

  logger.info(
    { userId, pending, quotaUsed, quotaWindow, canRecommend },
    `Recommendation quota usage for user ${userId}.`,
  );

  return {
    pending,
    quotaUsed,
    maxPending,
    quotaLimit,
    quotaWindow,
    remainingPending,
    remainingQuota,
    canRecommend,
  };
};

/**
 * Shorthand guard used before dispatching or starting a run.
 * Returns a skip reason when the user is capped, otherwise null.
 */
export const getQuotaSkipReason = async (
  userId: string,
): Promise<"pending_cap_reached" | "quota_exhausted" | null> => {
  const usage = await getRecommendationQuotaUsageTask(userId);
  if (usage.remainingPending <= 0) return "pending_cap_reached";
  if (usage.remainingQuota <= 0) return "quota_exhausted";
  return null;
};

/**
 * Count unseen (notviewed) recommendations, including any rows created
 * concurrently since the last quota check. Used to cap inserts.
 */
export const countPendingRecommendationsTask = async (
  userId: string,
): Promise<number> => {
  const [row] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(schema.recommendations)
    .where(
      and(
        eq(schema.recommendations.userId, userId),
        eq(schema.recommendations.status, "notviewed"),
      ),
    );
  return row?.count ?? 0;
};
