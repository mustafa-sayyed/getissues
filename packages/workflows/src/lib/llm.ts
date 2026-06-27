import { LLMModel } from "../types/common.types.js";

export function getLLMModel(): LLMModel {
  const provider = (process.env.LLM_PROVIDER ?? "openai");
  const modelName = process.env.LLM_MODEL;

  switch (provider) {
    case "openai": {
      const model = modelName ?? "gpt-4o";
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is required when LLM_PROVIDER=openai");
      }
      return {
        id: `openai/${model}`,
        apiKey: process.env.OPENAI_API_KEY,
      };
    }

    case "groq": {
      const model = modelName ?? "llama-3.3-70b-versatile";
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is required when LLM_PROVIDER=groq");
      }
      return {
        id: `groq/${model}`,
        apiKey: process.env.GROQ_API_KEY,
      };
    }

    case "anthropic": {
      const model = modelName ?? "claude-sonnet-4-5";
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error(
          "ANTHROPIC_API_KEY is required when LLM_PROVIDER=anthropic",
        );
      }
      return {
        id: `anthropic/${model}`,
        apiKey: process.env.ANTHROPIC_API_KEY,
      };
    }

    case "google": {
      const model = modelName ?? "gemini-2.0-flash";
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is required when LLM_PROVIDER=google");
      }
      return {
        id: `google/${model}`,
        apiKey: process.env.GEMINI_API_KEY,
      };
    }

    default: {
      if(provider && modelName && process.env.LLM_API_KEY) {
        return {
          id: `${provider}/${modelName}`,
          apiKey: process.env.LLM_API_KEY,
        };
      }

      throw new Error("NO LLM_PROVIDER or LLM_MODEL or LLM_API_KEY is set. Please set these environment variables to use a custom LLM provider.");
    }
  }
}
