"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Bot,
  Bookmark,
  ChevronRight,
  CircleDot,
  Clock,
  ExternalLink,
  RefreshCw,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type IssueStatus = "open" | "closed" | "assigned";
type RecommendationStatus = "notviewed" | "viewed" | "bookmarked" | "deleted";
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

const issueStatusColor: Record<IssueStatus, string> = {
  open: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  assigned: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  closed: "bg-muted text-muted-foreground",
};

const agentRunColor: Record<AgentRunStatus, string> = {
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  running: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  failed: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const agentConfigColor: Record<AgentConfigStatus, string> = {
  idle: "bg-muted text-muted-foreground",
  running: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  paused: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

const langColor: Record<string, string> = {
  typescript: "bg-[#3178c6] text-white",
  javascript: "bg-[#f1e05a] text-black",
  python: "bg-[#3572A5] text-white",
  rust: "bg-[#dea584] text-black",
  go: "bg-[#00ADD8] text-black",
  java: "bg-[#b07219] text-white",
  default: "bg-[#64748b] text-white",
};

const defaultRecommendationStats: RecommendationStats = {
  total: 0,
  newCount: 0,
  bookmarkedCount: 0,
  averageMatchScore: null,
};

const defaultAgentRunStats: AgentRunStats = {
  total: 0,
  successful: 0,
  failed: 0,
  running: 0,
  lastRun: null,
};

const formatRelativeTime = (value: string | null) => {
  if (!value) return "Never";

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs)) return "Never";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatScore = (score: number | null) => {
  if (typeof score !== "number") return "N/A";
  return `${Math.round(score * 100)}%`;
};

const formatStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default function DashboardHomePage() {
  const [recommendationStats, setRecommendationStats] = useState(
    defaultRecommendationStats,
  );
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [agentRunStats, setAgentRunStats] = useState(defaultAgentRunStats);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [
        recommendationStatsResponse,
        recommendationsResponse,
        agentRunStatsResponse,
        agentRunsResponse,
        agentConfigResponse,
      ] = await Promise.all([
        fetch(`${apiUrl}/recommendations/stats`, { credentials: "include" }),
        fetch(`${apiUrl}/recommendations?limit=5`, { credentials: "include" }),
        fetch(`${apiUrl}/agent-runs/stats`, { credentials: "include" }),
        fetch(`${apiUrl}/agent-runs?limit=5`, { credentials: "include" }),
        fetch(`${apiUrl}/agent-config`, { credentials: "include" }),
      ]);

      const responses = [
        recommendationStatsResponse,
        recommendationsResponse,
        agentRunStatsResponse,
        agentRunsResponse,
        agentConfigResponse,
      ];

      const failedResponse = responses.find((response) => !response.ok);
      if (failedResponse) {
        throw new Error(`Failed to load dashboard (${failedResponse.status})`);
      }

      const recommendationStatsData =
        (await recommendationStatsResponse.json()) as RecommendationStatsResponse;
      const recommendationsData =
        (await recommendationsResponse.json()) as RecommendationsResponse;
      const agentRunStatsData =
        (await agentRunStatsResponse.json()) as AgentRunStatsResponse;
      const agentRunsData =
        (await agentRunsResponse.json()) as AgentRunsResponse;
      const agentConfigData =
        (await agentConfigResponse.json()) as AgentConfigResponse;

      setRecommendationStats(recommendationStatsData.stats);
      setRecommendations(recommendationsData.recommendations);
      setAgentRunStats(agentRunStatsData.stats);
      setAgentRuns(agentRunsData.agentRuns);
      setAgentConfigs(agentConfigData.configs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const primaryAgentConfig = useMemo(
    () =>
      agentConfigs.find((config) => config.configType === "general") ??
      agentConfigs[0] ??
      null,
    [agentConfigs],
  );

  const stats = [
    {
      label: "New Recommendations",
      value: recommendationStats.newCount.toString(),
      detail: `${recommendationStats.total} total active`,
      icon: Bot,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Average Match",
      value: formatScore(recommendationStats.averageMatchScore),
      detail: `${recommendationStats.bookmarkedCount} bookmarked`,
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Last Agent Run",
      value: agentRunStats.lastRun
        ? formatRelativeTime(agentRunStats.lastRun.startedAt)
        : "Never",
      detail: agentRunStats.lastRun
        ? formatStatus(agentRunStats.lastRun.status)
        : "No runs yet",
      icon: Clock,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
    {
      label: "Agent Status",
      value: primaryAgentConfig
        ? formatStatus(primaryAgentConfig.status)
        : "Idle",
      detail: primaryAgentConfig?.nextRunAt
        ? `Next ${formatRelativeTime(primaryAgentConfig.nextRunAt)}`
        : `${agentRunStats.running} running now`,
      icon: Zap,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your recommendations, agent activity, and stats
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/60 hover:border-primary/30 transition-colors group"
          >
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground truncate">
                    {isLoading ? "..." : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {isLoading ? "Loading" : stat.detail}
                  </p>
                </div>
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${stat.bg} group-hover:scale-105 transition-transform -mt-6 md:-mt-1`}
                >
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Recent AI Recommendations
              </h2>
              <p className="text-sm text-muted-foreground">
                Latest issues recommended by the AI Agent
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/dashboard/recommendations"
                className="flex items-center gap-1"
              >
                View all
                <ChevronRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3">
            {isLoading ? (
              <Card className="border-border/60">
                <CardContent className="flex items-center justify-center p-10 text-sm text-muted-foreground">
                  <Spinner className="mr-2" />
                  Loading recommendations...
                </CardContent>
              </Card>
            ) : recommendations.length === 0 ? (
              <Card className="border-border/60">
                <CardContent className="p-10 text-center">
                  <Bot className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    No recommendations yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your AI agent results will appear here after a run.
                  </p>
                </CardContent>
              </Card>
            ) : (
              recommendations.map((recommendation) => {
                const repoName =
                  recommendation.repo?.name ?? "Unknown repository";
                const languages = recommendation.repo?.languages?.length
                  ? recommendation.repo.languages.slice(0, 3)
                  : ["Unknown"];

                return (
                  <Card
                    key={recommendation.id}
                    className="border-border/60 hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 shrink-0 mt-0.5 items-center justify-center rounded-lg bg-primary/10">
                          <CircleDot className="size-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              {recommendation.issue.title}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                window.open(
                                  recommendation.issue.url,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                            >
                              <ExternalLink className="size-3.5" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                            {repoName}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <Badge
                              className={`text-[10px] px-1.5 py-0 font-medium border-0 ${issueStatusColor[recommendation.issue.status]}`}
                            >
                              {formatStatus(recommendation.issue.status)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 font-medium gap-1"
                            >
                              <Star className="size-3" />
                              {formatScore(recommendation.matchScore)} match
                            </Badge>
                            {recommendation.status === "bookmarked" && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 font-medium gap-1"
                              >
                                <Bookmark className="size-3" />
                                Saved
                              </Badge>
                            )}
                            {languages.map((language) => (
                              <span
                                key={language}
                                className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${langColor[language.toLowerCase()] ?? langColor.default}`}
                              >
                                {language}
                              </span>
                            ))}
                            <span className="ml-auto text-xs text-muted-foreground">
                              {formatRelativeTime(recommendation.recommendedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Agent Activity
            </h2>
            <p className="text-sm text-muted-foreground">
              Recent runs and recommendation generation
            </p>
          </div>

          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                    <Spinner className="mr-2" />
                    Loading runs...
                  </div>
                ) : agentRuns.length === 0 ? (
                  <div className="py-8 text-center">
                    <Clock className="mx-auto size-7 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      No agent runs yet
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Runs will show here after your agent starts working.
                    </p>
                  </div>
                ) : (
                  agentRuns.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-border/50 p-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-[10px] px-1.5 py-0 border-0 ${agentRunColor[run.status]}`}
                          >
                            {formatStatus(run.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(run.startedAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {run.recommendationsCreated ?? 0} recommendations
                          created
                        </p>
                      </div>
                      <Clock className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {primaryAgentConfig && (
            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      General Agent
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last run{" "}
                      {formatRelativeTime(primaryAgentConfig.lastRunAt)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Next run{" "}
                      {formatRelativeTime(primaryAgentConfig.nextRunAt)}
                    </p>
                  </div>
                  <Badge
                    className={`text-[10px] px-2 py-0.5 border-0 ${agentConfigColor[primaryAgentConfig.status]}`}
                  >
                    {formatStatus(primaryAgentConfig.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
