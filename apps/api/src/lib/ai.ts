import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embedMany } from "ai";
import { ApiLogger as logger } from "@packages/logging";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const embeddingModel = google.embedding(
  process.env.GOOGLE_EMBEDDING_MODEL ?? "gemini-embedding-2",
);

export const EMBEDDING_DIMENSIONS = 1536;

export const embedTexts = async (
  values: string[],
): Promise<number[][] | null> => {
  try {
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values,
      providerOptions: {
        google: { outputDimensionality: EMBEDDING_DIMENSIONS },
      },
    });

    return embeddings;
  } catch (error) {
    logger.error({ error }, "Error generating embeddings:");
    return null;
  }
};

export const embedText = async (
  value: string,
): Promise<number[] | null> => {
  const embeddings = await embedTexts([value]);
  return embeddings?.[0] ?? null;
};

export const toPgVector = (embedding: number[]): string =>
  `[${embedding.join(",")}]`;
