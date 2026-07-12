import { schema } from "@packages/db";

export type issue = typeof schema.issue.$inferSelect;

export type LLMModel = {
  id: `${string}/${string}`;
  apiKey: string;
};

export type IssueEvaluation = {
  issueId: string;
  score: number;
  reason: string;
};