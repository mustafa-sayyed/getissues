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
  Star,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import {
  AgentConfig,
  AgentConfigResponse,
  AgentRun,
  AgentRunsResponse,
  AgentRunStats,
  AgentRunStatsResponse,
  AgentRunStatus,
  Recommendation,
  RecommendationsResponse,
  RecommendationStats,
  RecommendationStatsResponse,
} from "@/types/dashboard";
import {
  formatCountdown,
  formatDateTime,
  formatRelativeTime,
  formatScore,
  formatStatus,
} from "@/lib/formatters";
import {
  agentConfigColor,
  agentRunColor,
  issueStatusColor,
  langColor,
} from "@/lib/colors";

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
  const [liveRun, setLiveRun] = useState<AgentRun | null>(null);
  const liveRunRef = useRef<{ id: string; status: AgentRunStatus } | null>(
    null,
  );

  const fetchDashboardData = useCallback(async (silent = false) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("Internal Server Error");
      setIsLoading(false);
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [
        recommendationStatsResponse,
        recommendationsResponse,
        agentRunStatsResponse,
        agentRunsResponse,
        agentConfigResponse,
      ] = await Promise.all([
        axios.get<RecommendationStatsResponse>(
          `${apiUrl}/recommendations/stats`,
          { withCredentials: true },
        ),
        axios.get<RecommendationsResponse>(
          `${apiUrl}/recommendations?limit=5`,
          {
            withCredentials: true,
          },
        ),
        axios.get<AgentRunStatsResponse>(`${apiUrl}/agent-runs/stats`, {
          withCredentials: true,
        }),
        axios.get<AgentRunsResponse>(`${apiUrl}/agent-runs?limit=5`, {
          withCredentials: true,
        }),
        axios.get<AgentConfigResponse>(`${apiUrl}/agent-config`, {
          withCredentials: true,
        }),
      ]);

      setRecommendationStats(recommendationStatsResponse.data.stats);
      setRecommendations(recommendationsResponse.data.recommendations);
      setAgentRunStats(agentRunStatsResponse.data.stats);
      setAgentRuns(agentRunsResponse.data.agentRuns);
      setAgentConfigs(agentConfigResponse.data.configs);
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

  // Live pipeline status: poll the latest agent run. When a run finishes,
  // refresh the dashboard quietly and notify the user.
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    let cancelled = false;

    const pollLiveRun = async () => {
      try {
        const { data } = await axios.get<AgentRunsResponse>(
          `${apiUrl}/agent-runs?limit=1`,
          { withCredentials: true },
        );
        if (cancelled) return;

        const latest = data.agentRuns[0] ?? null;
        setLiveRun(latest);

        const prev = liveRunRef.current;
        if (latest) {
          liveRunRef.current = { id: latest.id, status: latest.status };
        }

        if (
          prev &&
          latest &&
          prev.id === latest.id &&
          prev.status === "running" &&
          latest.status !== "running"
        ) {
          if (latest.status === "success") {
            toast.success(
              latest.recommendationsCreated
                ? `${latest.recommendationsCreated} new recommendations found.`
                : "Agent run finished.",
            );
          } else {
            toast.error("Agent run failed.");
          }
          void fetchDashboardData(true);
        }
      } catch {
        // Polling must never break the dashboard.
      }
    };

    void pollLiveRun();
    const intervalId = setInterval(() => void pollLiveRun(), 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [fetchDashboardData]);

  const primaryAgentConfig = useMemo(
    () =>
      agentConfigs.find((config) => config.configType === "general") ??
      agentConfigs[0] ??
      null,
    [agentConfigs],
  );

  // Ticking clock for the "Next Agent Run" countdown. Only ticks while a
  // future run is scheduled so the page doesn't re-render every second
  // for no reason.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!primaryAgentConfig?.nextRunAt) return;

    const intervalId = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(intervalId);
  }, [primaryAgentConfig?.nextRunAt]);

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
      label: "Next Agent Run",
      value: formatCountdown(primaryAgentConfig?.nextRunAt ?? null, now),
      detail: formatDateTime(primaryAgentConfig?.nextRunAt ?? null),
      icon: Clock,
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

      {liveRun &&
        (liveRun.status === "running" ? (
          <div className="flex items-center gap-3 rounded-lg border border-sky-500/30 bg-sky-500/5 p-4">
            <span className="relative flex size-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-sky-500" />
            </span>
            <p className="text-sm text-foreground">
              <span className="font-medium">Agent is finding new matches…</span>{" "}
              <span className="text-muted-foreground">
                Started {formatRelativeTime(liveRun.startedAt)}
              </span>
            </p>
            <Link
              href="/dashboard/agent-runs"
              className="ml-auto shrink-0 text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
            >
              View runs
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
            <Bot className="size-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Last run {formatRelativeTime(liveRun.startedAt)} ·{" "}
              {liveRun.recommendationsCreated ?? 0} new matches
            </p>
            <Link
              href="/dashboard/agent-runs"
              className="ml-auto shrink-0 text-sm font-medium text-primary hover:underline"
            >
              View runs
            </Link>
          </div>
        ))}

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
