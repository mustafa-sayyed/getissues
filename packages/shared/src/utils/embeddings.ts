import { VoyageAIClient } from "voyageai";
import { logger } from "../logging/index.js";

/** Dimension of every stored embedding. Must match the `vector(1536)` columns. */
export const EMBEDDING_DIMENSIONS = 1536;

/** Default VoyageAI model. `voyage-code-2` outputs 1536 dims out of the box. */
export const VOYAGE_EMBEDDING_MODEL = "voyage-code-2";

export interface EmbedTextsOptions {
  /** VoyageAI model id. Defaults to `VOYAGE_EMBEDDING_MODEL`. */
  model?: string;
  /** Max attempts against the configured key. Defaults to 1. */
  maxRetries?: number;
}

let voyageClient: VoyageAIClient | null = null;

/**
 * Create VoyageAI embeddings for a batch of texts in a single API call.
 */
export const embedTexts = async (
  values: string[],
  options?: EmbedTextsOptions,
): Promise<number[][] | null> => {
  if (values.length === 0) {
    return [];
  }

  if (!voyageClient) {
    const key = process.env.VOYAGE_API_KEY;

    if (!key) {
      logger.error("No VoyageAI API key configured.");
      return null;
    }

    voyageClient = new VoyageAIClient({ apiKey: key });
  }

  const client = voyageClient;

  const model = options?.model ?? VOYAGE_EMBEDDING_MODEL;
  const maxAttempts = options?.maxRetries ?? 1;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await client.embed({ input: values, model });
      const vectors = response.data?.map((item) => item?.embedding ?? []) ?? [];

      if (
        vectors.length !== values.length ||
        vectors.some((vector) => vector.length === 0)
      ) {
        throw new Error("VoyageAI returned an incomplete embedding batch.");
      }

      return vectors as number[][];
    } catch (error) {
      lastError = error;
      logger.error(
        { error, attempt: attempt + 1 },
        "VoyageAI embedding attempt failed.",
      );
    }
  }

  logger.error({ error: lastError }, "All VoyageAI embedding attempts failed.");
  return null;
};

/** Create a single VoyageAI embedding. Returns `null` on failure. */
export const embedText = async (
  value: string,
  options?: EmbedTextsOptions,
): Promise<number[] | null> => {
  const embeddings = await embedTexts([value], options);
  return embeddings?.[0] ?? null;
};

/**
 * Compatibility wrapper matching the old workflows `getEmbeddings` shape.
 * Prefers `embedText` for new code; kept so existing call sites that check
 * `result.embeddings.length === 0` keep working unchanged.
 */
export const getEmbeddings = async (
  text: string,
  options?: EmbedTextsOptions,
): Promise<{ embeddings: number[] }> => {
  const embedding = await embedText(text, options);
  return { embeddings: embedding ?? [] };
};

/** Serialize an embedding vector for Postgres `vector` columns. */
export const toPgVector = (embedding: number[]): string =>
  `[${embedding.join(",")}]`;
