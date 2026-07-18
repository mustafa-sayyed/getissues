import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { WorkflowLogger as logger } from "@packages/logging";
import { getVoyageClient } from "./voyage.js";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export const getEmbeddings = async (
  text: string,
  retryCount: number = 0,
  provider: string = "voyage-1",
): Promise<{ embeddings: number[] }> => {
  logger.info(`Attempt ${retryCount + 1} time to get embedding.`);

  let embedding: number[] = [];

  try {
    switch (provider) {
      case "voyage-1":
        const voyageClient = getVoyageClient(process.env.VOYAGE_API_KEY);
        const embedRes = await voyageClient.embed({
          input: [text],
          model: "voyage-code-2",
        });
        embedding = embedRes.data?.[0]?.embedding ?? [];
        return { embeddings: embedding };
        break;
      case "google":
        const response = await ai.models.embedContent({
          model: "gemini-embedding-2",
          contents: [text],
          config: {
            outputDimensionality: 1536,
          },
        });

        if (response.embeddings && response.embeddings.length > 0) {
          const embeddingValues = response.embeddings[0].values ?? [];
          return { embeddings: embeddingValues };
        }
        break;

      case "voyage-2":
        const voyage = getVoyageClient(process.env.VOYAGE_API_KEY2);
        const embedRes2 = await voyage.embed({
          input: [text],
          model: "voyage-code-2",
        });
        embedding = embedRes2.data?.[0]?.embedding ?? [];
        return { embeddings: embedding };
        break;
    }

    return { embeddings: embedding };
  } catch (error) {
    logger.error({ error }, "Error generating embeddings:");
    if (retryCount < 3) {
      logger.info(`Retrying embedding generation... Attempt ${retryCount + 1}`);
      const nextProvider =
        provider === "voyage-1"
          ? "google"
          : provider === "google"
            ? "voyage-2"
            : "voyage-1";
      return getEmbeddings(text, retryCount + 1, nextProvider);
    }
  }

  return { embeddings: embedding };
};
