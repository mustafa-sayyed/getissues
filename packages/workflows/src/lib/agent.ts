import { Agent } from "@mastra/core/agent";

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
  model: [
    {model: "groq/openai/gpt-oss-120b", maxRetries: 2},
    {model: "google/gemini-2.5-flash", maxRetries: 1},
    {model: "cloudflare-workers-ai/@cf/openai/gpt-oss-120b"},
    {model: "google/gemini-3-flash-preview", maxRetries: 1},
  ],
});
