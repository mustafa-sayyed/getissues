
type IssueStatus = "open" | "closed" | "assigned";
type RecommendationStatus =
  | "notviewed"
  | "viewed"
  | "bookmarked"
  | "notinterested";
type AgentRunStatus = "failed" | "success" | "running";
type AgentConfigStatus = "idle" | "running" | "paused";

type Recommendation = {
  id: string;
  reason: string | null;
  matchScore: number | null;
  status: RecommendationStatus;
  recommendedAt: string | null;
  issue: {
    id: string;
    title: string;
    status: IssueStatus;
    url: string;
    createdAt: string | null;
  };
  repo: {
    name: string | null;
    languages: string[] | null;
    stars: number | null;
  } | null;
};

type AgentRun = {
  id: string;
  status: AgentRunStatus;
  startedAt: string | null;
  endedAt: string | null;
  recommendationsCreated?: number;
};

type AgentConfig = {
  id: string;
  configType: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
  status: AgentConfigStatus;
};

type RecommendationStatsResponse = {
  stats: {
    total: number;
    newCount: number;
    bookmarkedCount: number;
    averageMatchScore: number | null;
  };
};

type RecommendationsResponse = {
  recommendations: Recommendation[];
};

type AgentRunStatsResponse = {
  stats: {
    total: number;
    successful: number;
    failed: number;
    running: number;
    lastRun: AgentRun | null;
  };
};

type AgentRunsResponse = {
  agentRuns: AgentRun[];
};

type AgentConfigResponse = {
  configs: AgentConfig[];
};

type RecommendationStats = RecommendationStatsResponse["stats"];
type AgentRunStats = AgentRunStatsResponse["stats"];


export type {
    AgentConfig,
    AgentConfigResponse,
    AgentConfigStatus,
    AgentRun,
    AgentRunStats,
    AgentRunStatsResponse,
    AgentRunStatus,
    AgentRunsResponse,
    IssueStatus,
    Recommendation,
    RecommendationStats,
    RecommendationStatsResponse,
    RecommendationStatus,
    RecommendationsResponse,
}