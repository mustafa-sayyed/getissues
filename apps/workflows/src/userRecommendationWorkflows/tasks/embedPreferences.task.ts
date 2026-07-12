import { task } from "@renderinc/sdk/workflows";
import { getVoyageClient } from "../../lib/voyage.js";

/**
 * Task: Embed user preference text via VoyageAI.
 *
 * Takes a plain-text description of the user's skills/preferences and
 * returns a 1536-dimensional embedding vector.
 *
 * Responsibility: ONE — embed the preferences text.
 */
export const embedPreferencesTask = task(
  { name: "embedPreferencesTask", plan: "starter" },
  async (preferencesText: string): Promise<number[]> => {
    const voyage = getVoyageClient();

    const embedRes = await voyage.embed({
      input: [preferencesText],
      model: "voyage-code-2",
    });

    const embedding: number[] = embedRes.data?.[0]?.embedding ?? [];

    if (embedding.length === 0) {
      throw new Error("VoyageAI returned an empty embedding for user preferences.");
    }

    return embedding;
  }
);
