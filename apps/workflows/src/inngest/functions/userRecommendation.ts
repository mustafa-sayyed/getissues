import { WorkflowLogger as logger } from "@packages/logging";
import { inngest } from "../client.js";
import { INNGEST_EVENTS } from "../events.js";
import {
  completeAgentRunTask,
  getUserSkillsTask,
  scoreIssueTask,
  semanticSearchIssuesTask,
  startAgentRunTask,
  storeRecommendationTask,
} from "../../core/userRecommendation/index.js";
import { getUserDecisionContext } from "../../lib/cognee.js";
import { db, eq, schema } from "../../lib/db.js";
import type { issue } from "../../types/common.types.js";

const BATCH_SIZE = 3;

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
    const users = await step.run("fetch-users-with-issue-search-enabled", () =>
      db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(schema.user.searchIssues, true)),
    );

    if (users.length === 0) {
      return {
        success: true,
        dispatchedUsers: 0,
      };
    }

    await step.sendEvent(
      "dispatch-user-recommendation-runs",
      users.map((user) => ({
        name: INNGEST_EVENTS.runUserRecommendation,
        data: {
          userId: user.id,
        },
      })),
    );

    return {
      success: true,
      dispatchedUsers: users.length,
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

      agentRunId = await step.run(`start-agent-run-${userId}`, () =>
        startAgentRunTask(userId),
      );

      const decisionContext = await step.run(
        `get-user-decision-context-${userId}`,
        () => getUserDecisionContext(userId, userSkills.skills),
      );

      const candidateIssues = await step.run(
        `semantic-search-issues-${userId}`,
        () => semanticSearchIssuesTask(userSkills.embedding, userId),
      );

      let recommended = 0;
      let belowThreshold = 0;

      for (let i = 0; i < candidateIssues.length; i += BATCH_SIZE) {
        const batch = candidateIssues.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

        const evaluations = await step.run(
          `score-issue-batch-${userId}-${batchNumber}`,
          () =>
            scoreIssueTask(
              batch as unknown as issue[],
              userSkills.skills,
              decisionContext,
            ),
        );

        const storeResult = await step.run(
          `store-recommendation-batch-${userId}-${batchNumber}`,
          () => storeRecommendationTask(userId, agentRunId!, evaluations),
        );

        recommended += storeResult.recommended;
        belowThreshold += storeResult.belowThreshold;
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
        candidateIssues: candidateIssues.length,
        recommended,
        belowThreshold,
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
