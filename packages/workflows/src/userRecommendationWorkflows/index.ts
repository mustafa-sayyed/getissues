import { task } from "@renderinc/sdk/workflows";
import { startAgentRunTask } from "./tasks/startAgentRun.task.js";
import { embedPreferencesTask } from "./tasks/embedPreferences.task.js";
import { semanticSearchIssuesTask } from "./tasks/searchIssues.task.js";
import { scoreIssueTask } from "./tasks/scoreIssue.task.js";
import { storeRecommendationTask } from "./tasks/storeRecommendation.task.js";
import { completeAgentRunTask } from "./tasks/completeAgentRun.task.js";
import { getUserSkillsTask } from "./tasks/getUserSkills.tesk.js";

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
export const userAgentRunsWorkflow = task(
  { name: "userAgentRunsWorkflow", plan: "starter" },
  async (userId: string) => {
    let agentRunId: string | undefined;

    try {
      // Step 1: Create agent run record
      agentRunId = await startAgentRunTask(userId);

      // Step 2: Embed user preferences
      const {embedding: userSkillsEmbedding, skills} = await getUserSkillsTask(userId);

      // Step 3: Find semantically similar issues
      const candidateIssues = await semanticSearchIssuesTask(userSkillsEmbedding);

      // Step 4 + 5: Score each issue independently, then store if above threshold
      for (const issue of candidateIssues) {
        const matchScore = await scoreIssueTask(issue, skills);
        await storeRecommendationTask(userId, agentRunId, issue, matchScore);
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
      // Mark the run as failed so the UI can surface the error
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
