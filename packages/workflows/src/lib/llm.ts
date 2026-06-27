import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { openai } from "@ai-sdk/openai";
import type { LanguageModelV4, LanguageModelV3 } from "@ai-sdk/provider";

/**
 * Supported LLM providers.
 */
export type LLMProvider = "openai" | "groq" | "anthropic" | "google";

/**
 * Returns a Vercel AI SDK language model instance based on environment variables.
 *
 * Required env vars:
 * - LLM_PROVIDER  — one of: openai (default) | groq | anthropic | google
 * - LLM_MODEL     — model name e.g. "gpt-4o", "llama-3.3-70b-versatile", "claude-sonnet-4-5", "gemini-2.0-flash"
 * - The API key for the selected provider (see table below)
 *
 * | LLM_PROVIDER | API Key env var                 | Default model              |
 * | openai       | OPENAI_API_KEY                  | gpt-4o                     |
 * | groq         | GROQ_API_KEY                    | llama-3.3-70b-versatile    |
 * | anthropic    | ANTHROPIC_API_KEY               | claude-sonnet-4-5          |
 * | google       | GOOGLE_GENERATIVE_AI_API_KEY    | gemini-2.0-flash           |
 */

export function getLLMModel(): LanguageModelV3 | LanguageModelV4 {
  const provider = (process.env.LLM_PROVIDER ?? "openai") as LLMProvider;
  const modelName = process.env.LLM_MODEL;

  switch (provider) {
    case "openai": {
      const model = modelName ?? "gpt-4o";
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is required when LLM_PROVIDER=openai");
      }
      return openai(model);
    }

    case "groq": {
      const model = modelName ?? "llama-3.3-70b-versatile";
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is required when LLM_PROVIDER=groq");
      }
      const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
      return groq(model);
    }

    case "anthropic": {
      const model = modelName ?? "claude-sonnet-4-5";
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error(
          "ANTHROPIC_API_KEY is required when LLM_PROVIDER=anthropic",
        );
      }
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      return anthropic(model);
    }

    case "google": {
      const model = modelName ?? "gemini-2.0-flash";
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is required when LLM_PROVIDER=google");
      }
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
      return google(model);
    }

    default: {
      throw new Error(
        `Unsupported LLM_PROVIDER: "${provider}". ` +
          `Supported values are: openai, groq, anthropic, google`,
      );
    }
  }
}
