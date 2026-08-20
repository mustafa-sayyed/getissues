import { schema } from "@packages/db";

type issue = typeof schema.issue.$inferSelect;

type LLMModel = {
  id: `${string}/${string}`;
  apiKey: string;
};

type IssueEvaluation = {
  issueId: string;
  score: number;
  reason: string;
};

type IssueCleanupUpdateResult = {
  checked: boolean;
  updated: boolean;
  unavailable: boolean;
};

type LiveIssueStatus = {
  id: string;
  status: "open" | "closed" | "assigned";
  isAssigned: boolean;
  isActive: boolean;
  unavailable: boolean;
};

type CleanupIssueCandidate = {
  id: string;
  url: string;
  status: "open" | "closed" | "assigned";
  isAssigned: boolean | null;
  isActive: boolean | null;
};

export type {
  CleanupIssueCandidate,
  IssueCleanupUpdateResult,
  IssueEvaluation,
  LLMModel,
  LiveIssueStatus,
  issue,
};
