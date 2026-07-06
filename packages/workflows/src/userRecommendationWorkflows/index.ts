import { task } from "@renderinc/sdk/workflows";
import { startAgentRunTask } from "./tasks/startAgentRun.task.js";
import { embedPreferencesTask } from "./tasks/embedPreferences.task.js";
import { semanticSearchIssuesTask } from "./tasks/searchIssues.task.js";
import { scoreIssueTask } from "./tasks/scoreIssue.task.js";
import { storeRecommendationTask } from "./tasks/storeRecommendation.task.js";
import { completeAgentRunTask } from "./tasks/completeAgentRun.task.js";
import { getUserSkillsTask } from "./tasks/getUserSkills.tesk.js";
import { getUserDecisionContext } from "../utils/cognee.js";

/**
 * User Recommendation Workflow
 *
 * Orchestrates the full recommendation pipeline for a given user.
 *
 * Task execution chain:
 *   userAgentRunsWorkflow
 *     => startAgentRunTask          — create agentRun record in DB
 *           => embedPreferencesTask — embed user skills via VoyageAI
 *                 => semanticSearchIssuesTask — pgvector similarity search
 *                       => scoreIssueTask (×N)        — LLM scores each issue
 *                             => storeRecommendationTask (×N) — DB insert if score ≥ 0.7
 *                       => completeAgentRunTask        — mark agentRun as success/failed
 *
 * Responsibility: orchestration only — delegates all work to focused sub-tasks.
 */

const BATCH_SIZE = 3; // 3 issues per LLM call

export const userAgentRunsWorkflow = task(
  { name: "userAgentRunsWorkflow", plan: "starter" },
  async (userId: string) => {
    let agentRunId: string | undefined;

    try {
      // Step 1: Create agent run record
      agentRunId = await startAgentRunTask(userId);

      // Step 2: Embed user preferences
      const { embedding: userSkillsEmbedding, skills } =
        await getUserSkillsTask(userId);

      const decisionContext = await getUserDecisionContext(userId, skills);

      // Step 3: Find semantically similar issues
      const candidateIssues = await semanticSearchIssuesTask(
        userSkillsEmbedding,
        userId,
      );

      // Step 4 + 5: Score issue in batch, then store if above threshold otherwise store in agent eval
      for (let i = 0; i < candidateIssues.length; i += BATCH_SIZE) {
        const batch = candidateIssues.slice(i, i + BATCH_SIZE);

        // score the batch — one LLM call for 5 issues
        const evaluations = await scoreIssueTask(
          batch,
          skills,
          decisionContext,
        );

        // store the whole batch — two bulk DB inserts (recommend + evaluate)
        await storeRecommendationTask(userId, agentRunId, evaluations);
      }

      // Step 6: Mark run as completed successfully
      await completeAgentRunTask(agentRunId, "success");

      console.log(`User recommendation workflow completed for user ${userId}.`);

      return {
        success: true,
        message: `User recommendation workflow completed for user ${userId}.`,
        agentRunId,
      };
    } catch (error) {
      // Mark the run as failed
      if (agentRunId) {
        await completeAgentRunTask(agentRunId, "failed");
      }
      throw error;
    }
  },
);

// **** Re-exports ****
// All individual tasks are exported so they can be registered with the
// Render workflow runner independently.

export { startAgentRunTask } from "./tasks/startAgentRun.task.js";
export { embedPreferencesTask } from "./tasks/embedPreferences.task.js";
export { getUserSkillsTask } from "./tasks/getUserSkills.tesk.js";
export { semanticSearchIssuesTask } from "./tasks/searchIssues.task.js";
export { scoreIssueTask } from "./tasks/scoreIssue.task.js";
export { storeRecommendationTask } from "./tasks/storeRecommendation.task.js";
export { completeAgentRunTask } from "./tasks/completeAgentRun.task.js";
