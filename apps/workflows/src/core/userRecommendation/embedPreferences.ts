import { embedText } from "@packages/shared";

/**
 * Task: Embed user preference text via VoyageAI.
 *
 * Takes a plain-text description of the user's skills/preferences and
 * returns a 1536-dimensional embedding vector.
 *
 * Responsibility: ONE — embed the preferences text.
 */
export const embedPreferencesTask = async (
  preferencesText: string,
): Promise<number[]> => {
  const embedding = await embedText(preferencesText);

  if (!embedding || embedding.length === 0) {
    throw new Error(
      "VoyageAI returned an empty embedding for user preferences.",
    );
  }

  return embedding;
};
