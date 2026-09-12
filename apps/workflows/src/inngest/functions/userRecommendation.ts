import { and, exists, gt, gte, inArray } from "drizzle-orm";
import { WorkflowLogger as logger } from "@packages/logging";
import { inngest } from "../client.js";
import { INNGEST_EVENTS } from "../events.js";
import {
  completeAgentRunTask,
  getBlockedRepoIdsTask,
  getNegativeSignalsTextTask,
  getRecommendationQuotaUsageTask,
  getUserSkillsTask,
  scoreIssueTask,
  semanticSearchIssuesTask,
  startAgentRunTask,
  storeRecommendationTask,
} from "../../core/userRecommendation/index.js";
import type { QuotaWindow } from "../../core/userRecommendation/index.js";
import { getUserDecisionContext } from "../../lib/cognee.js";
import { db, eq, schema, sql } from "../../lib/db.js";
import type { issue } from "../../types/common.types.js";

const BATCH_SIZE = 3;

// Users who haven't been seen for longer than this get no runs dispatched.
const ACTIVE_WINDOW_DAYS = 7;

// Hours between scheduler ticks. MUST match the cron below ("0 */4 * * *") —
// it drives the nextRunAt published to agent_config for the dashboard countdown.
const SCHEDULER_INTERVAL_HOURS = 4;

type RunUserRecommendationEvent = {
  userId: string;
};

export const userRecommendationSchedulerWorkflow = inngest.createFunction(
  {
    id: "user-recommendation-scheduler",
    name: "User Recommendation Scheduler",
    triggers: [{ cron: "0 */4 * * *" }],
  },
  async ({ step }) => {
    const activeCutoff = new Date(
      Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );
    const now = new Date();

    const users = await step.run(
      "fetch-active-users-with-issue-search-enabled",
      () =>
        db
          .select({
            id: schema.user.id,
            maxPending: schema.user.maxPendingRecommendations,
            quotaLimit: schema.user.recommendationQuotaLimit,
            quotaWindow: schema.user.recommendationQuotaWindow,
          })
          .from(schema.user)
          .where(
            and(
              eq(schema.user.searchIssues, true),
              exists(
                db
                  .select({ one: sql<number>`1` })
                  .from(schema.session)
                  .where(
                    and(
                      eq(schema.session.userId, schema.user.id),
                      gte(schema.session.updatedAt, activeCutoff),
                      gt(schema.session.expiresAt, now),
                    ),
                  ),
              ),
            ),
          ),
    );

    const [totalRow] = await step.run(
      "count-users-with-issue-search-enabled",
      () =>
        db
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(schema.user)
          .where(eq(schema.user.searchIssues, true)),
    );
    const skippedInactive = Math.max(
      0,
      (totalRow?.count ?? users.length) - users.length,
    );
    const activeUsers = users;

    if (users.length === 0) {
      return {
        success: true,
        dispatchedUsers: 0,
        skippedInactive,
        skippedPendingCap: 0,
        skippedQuota: 0,
      };
    }

    // 2. One grouped query for backlog + window usage of all active users.
    const usageRows = await step.run("fetch-recommendation-usage", async () =>
      db
        .select({
          userId: schema.recommendations.userId,
          pending:
            sql<number>`count(*) filter (where ${schema.recommendations.status} = 'notviewed')`.mapWith(
              Number,
            ),
          dayCount:
            sql<number>`count(*) filter (where ${schema.recommendations.recommendedAt} >= now() - interval '1 day')`.mapWith(
              Number,
            ),
          weekCount:
            sql<number>`count(*) filter (where ${schema.recommendations.recommendedAt} >= now() - interval '7 days')`.mapWith(
              Number,
            ),
          monthCount:
            sql<number>`count(*) filter (where ${schema.recommendations.recommendedAt} >= now() - interval '30 days')`.mapWith(
              Number,
            ),
        })
        .from(schema.recommendations)
        .where(
          inArray(
            schema.recommendations.userId,
            activeUsers.map((u) => u.id),
          ),
        )
        .groupBy(schema.recommendations.userId),
    );

    const usageByUser = new Map(usageRows.map((r) => [r.userId, r]));

    // 3. Apply per-user caps: pending backlog + quota window allowance.
    const windowCount = (
      quotaWindow: QuotaWindow,
      row: { dayCount: number; weekCount: number; monthCount: number },
    ) =>
      quotaWindow === "day"
        ? row.dayCount
        : quotaWindow === "week"
          ? row.weekCount
          : row.monthCount;

    let skippedPendingCap = 0;
    let skippedQuota = 0;
    const dispatchable = activeUsers.filter((u) => {
      const row = usageByUser.get(u.id) ?? {
        dayCount: 0,
        weekCount: 0,
        monthCount: 0,
        pending: 0,
      };
      if (row.pending >= (u.maxPending ?? 15)) {
        skippedPendingCap += 1;
        return false;
      }
      if (windowCount(u.quotaWindow ?? "day", row) >= (u.quotaLimit ?? 5)) {
        skippedQuota += 1;
        return false;
      }
      return true;
    });

    if (dispatchable.length > 0) {
      await step.sendEvent(
        "dispatch-user-recommendation-runs",
        dispatchable.map((user) => ({
          name: INNGEST_EVENTS.runUserRecommendation,
          data: {
            userId: user.id,
          },
        })),
      );
    }

    // 4. Publish the schedule to agent_config so the dashboard "Next Agent
    // Run" countdown and the General Agent card stay truthful.
    // nextRunAt = next scheduler tick (set for every active user, even
    // skipped ones — they get re-evaluated then). lastRunAt = this tick,
    // but only for users a run was actually dispatched for.
    const nextTickAt = new Date(
      now.getTime() + SCHEDULER_INTERVAL_HOURS * 60 * 60 * 1000,
    );
    const dispatchedIds = new Set(dispatchable.map((u) => u.id));

    await step.run("update-agent-config-schedule", async () => {
      await db
        .insert(schema.agentConfig)
        .values(
          activeUsers.map((u) => ({
            userId: u.id,
            configType: "general" as const,
            nextRunAt: nextTickAt,
          })),
        )
        .onConflictDoUpdate({
          target: [schema.agentConfig.userId, schema.agentConfig.configType],
          set: { nextRunAt: nextTickAt },
        });

      if (dispatchedIds.size > 0) {
        await db
          .update(schema.agentConfig)
          .set({ lastRunAt: now })
          .where(
            and(
              inArray(schema.agentConfig.userId, [...dispatchedIds]),
              eq(schema.agentConfig.configType, "general"),
            ),
          );
      }
    });

    logger.info(
      {
        dispatched: dispatchable.length,
        skippedUsers: {
          inactive: skippedInactive,
          pendingIssuesCapReached: skippedPendingCap,
          quotaExhausted: skippedQuota,
        },
      },
      "User recommendation scheduler finished.",
    );

    return {
      success: true,
      dispatchedUsers: dispatchable.length,
      scheduledUsers: activeUsers.length,
      skippedUsers: {
        inactive: skippedInactive,
        pendingIssuesCapReached: skippedPendingCap,
        quotaExhausted: skippedQuota,
      },
    };
  },
);

export const userAgentWorkflow = inngest.createFunction(
  {
    id: "user-agent-workflow",
    name: "User Recommendation Workflow",
    description:
      "Orchestrates the full recommendation pipeline for a given user.",
    triggers: [{ event: INNGEST_EVENTS.runUserRecommendation }],
    // Backstop: at most one run per user per hour, even if events pile up.
    throttle: { limit: 1, period: "1h", key: "event.data.userId" },
  },
  async ({ event, step }) => {
    const { userId } = event.data as RunUserRecommendationEvent;
    let agentRunId: string | undefined;

    try {
      const userSkills = await step.run(`get-user-skills-${userId}`, () =>
        getUserSkillsTask(userId),
      );

      if (!userSkills) {
        logger.info(
          { userId },
          `Skipping user recommendation workflow for user ${userId} as they have no skills.`,
        );

        return {
          success: true,
          skipped: true,
          reason: "missing_user_skills",
          userId,
        };
      }

      // Quota guard (re-checked here: scheduler state may be stale or
      // concurrent runs may have filled the allowance since dispatch).
      const quota = await step.run(`check-quota-${userId}`, () =>
        getRecommendationQuotaUsageTask(userId),
      );

      if (!quota.canRecommend) {
        const reason =
          quota.remainingPending <= 0
            ? "pending_cap_reached"
            : "quota_exhausted";
        logger.info(
          {
            userId,
            reason,
            pending: quota.pending,
            quotaUsed: quota.quotaUsed,
          },
          `Skipping user recommendation workflow for user ${userId} (quota).`,
        );

        return {
          success: true,
          skipped: true,
          reason,
          userId,
        };
      }

      const maxNewForRun = Math.min(
        quota.remainingPending,
        quota.remainingQuota,
      );

      agentRunId = await step.run(`start-agent-run-${userId}`, () =>
        startAgentRunTask(userId),
      );

      const decisionContext = await step.run(
        `get-user-decision-context-${userId}`,
        () => getUserDecisionContext(userId, userSkills.skills),
      );

      const candidateIssues = await step.run(
        `semantic-search-issues-${userId}`,
        async () => {
          // Cheap DB reads: excluded repos + rejection examples for scoring.
          const [blockedRepoIds, negativeSignalsText] = await Promise.all([
            getBlockedRepoIdsTask(userId),
            getNegativeSignalsTextTask(userId),
          ]);
          const issues = await semanticSearchIssuesTask(
            userSkills.embedding,
            userId,
            blockedRepoIds,
          );
          return { issues, negativeSignalsText };
        },
      );

      const candidates = candidateIssues.issues;
      const negativeSignalsText = candidateIssues.negativeSignalsText;

      let recommended = 0;
      let belowThreshold = 0;
      let skippedByCap = 0;

      for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
        // Stop scoring more batches once this run's allowance is spent —
        // scoring is the expensive part (LLM calls per issue).
        if (recommended >= maxNewForRun) {
          logger.info(
            { userId, recommended, maxNewForRun },
            `Run allowance reached for user ${userId}; stopping scoring.`,
          );
          break;
        }

        const batch = candidates.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

        const evaluations = await step.run(
          `score-issue-batch-${userId}-${batchNumber}`,
          () =>
            scoreIssueTask(
              batch as unknown as issue[],
              userSkills.skills,
              decisionContext,
              negativeSignalsText,
            ),
        );

        const storeResult = await step.run(
          `store-recommendation-batch-${userId}-${batchNumber}`,
          () =>
            storeRecommendationTask(
              userId,
              agentRunId!,
              evaluations,
              maxNewForRun - recommended,
            ),
        );

        recommended += storeResult.recommended;
        belowThreshold += storeResult.belowThreshold;
        skippedByCap += storeResult.skippedByCap;
      }

      await step.run(`complete-agent-run-${agentRunId}`, () =>
        completeAgentRunTask(agentRunId!, "success"),
      );

      logger.info(
        { userId, agentRunId },
        `User recommendation workflow completed for user ${userId}.`,
      );

      return {
        success: true,
        userId,
        agentRunId,
        candidateIssues: candidates.length,
        recommended,
        belowThreshold,
        skippedByCap,
      };
    } catch (error) {
      logger.error(
        { error, userId, agentRunId },
        `User recommendation workflow failed for user ${userId}.`,
      );

      if (agentRunId) {
        await step.run(`fail-agent-run-${agentRunId}`, () =>
          completeAgentRunTask(agentRunId!, "failed"),
        );
      }

      throw error;
    }
  },
);
