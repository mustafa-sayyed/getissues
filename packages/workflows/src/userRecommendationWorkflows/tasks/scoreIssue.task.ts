import { task } from "@renderinc/sdk/workflows";
import { scoringAgent } from "../../lib/agent.js";
import { issue } from "../../types/common.types.js";

/**
 * Task: Score a single GitHub issue against a user's skills using the LLM.
 *
 * Calls the Mastra scoring agent with the issue details and user skills text,
 * then parses the response into a numeric score (0.0 – 1.0).
 *
 * Responsibility: ONE — LLM scoring of a single issue.
 */
export const scoreIssueTask = task(
  { name: "scoreIssueTask", plan: "starter" },
  async (issue: issue, userSkillsText: string): Promise<number> => {
    const prompt =
      `Evaluate this GitHub issue as a task for a developer:\n\n` +
      `Title: ${issue.title}\n` +
      `Description: ${issue.body ?? "(no description)"}\n\n` +
      `Developer skills: ${userSkillsText}\n\n` +
      `Return ONLY a decimal number between 0.0 and 1.0.`;

    const result = await scoringAgent.generate(prompt);
    const score = parseFloat(result.text.trim());

    // Fallback to neutral score if the model returns non-numeric output
    const matchScore = Number.isFinite(score) ? score : 0.5;

    console.log(`Issue "${issue.title}" scored: ${matchScore}`);
    return matchScore;
  },
);
