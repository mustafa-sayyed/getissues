import { Agent } from "@mastra/core/agent";
import { getLLMModel } from "./llm.js";

/**
 * Mastra Scoring Agent.
 */
export const scoringAgent = new Agent({
  id: "scoring-agent",
  name: "Scoring Agent",
  instructions:
    "You are an AI that evaluates if a GitHub issue is a good fit for a user based on their skills. " +
    "Return ONLY a single decimal number between 0.0 and 1.0 representing how well the issue matches " +
    "the user's skills. Do not include any explanation or extra text.",
  model: getLLMModel(),
});
