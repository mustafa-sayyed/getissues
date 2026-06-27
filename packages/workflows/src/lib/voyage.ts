import { VoyageAIClient } from "voyageai";

let _client: VoyageAIClient | null = null;

export function getVoyageClient(): VoyageAIClient {
  if (!_client) {
    if (!process.env.VOYAGE_API_KEY) {
      throw new Error("VOYAGE_API_KEY environment variable is not set.");
    }
    _client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
  }
  return _client;
}
