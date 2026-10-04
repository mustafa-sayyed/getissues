import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LiveRunBanner } from "@/components/dashboard/live-run-banner";
import { NextRunCountdown } from "@/components/dashboard/next-run-countdown";
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
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import axios from "axios";
import {
  AgentConfigResponse,
  AgentRunsResponse,
  AgentRunStats,
  AgentRunStatsResponse,
  RecommendationStats,
  RecommendationStatsResponse,
  RecommendationsResponse,
} from "@/types/dashboard";
import {
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
import { authClient } from "@/lib/auth-client";

export const dynamic = "force-dynamic";

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

export default async function DashboardHomePage() {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie") ?? "";
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: requestHeaders,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your recommendations, agent activity, and stats
          </p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
          Internal Server Error
        </div>
      </div>
    );
  }

  let recommendationStats = defaultRecommendationStats;
  let recommendations: RecommendationsResponse["recommendations"] = [];
  let agentRunStats = defaultAgentRunStats;
  let agentRuns: AgentRunsResponse["agentRuns"] = [];
  let agentConfigs: AgentConfigResponse["configs"] = [];
  let error: string | null = null;

  try {
    const [
      recommendationStatsResponse,
      recommendationsResponse,
      agentRunStatsResponse,
      agentRunsResponse,
      agentConfigResponse,
    ] = await Promise.all([
      axios.get<RecommendationStatsResponse>(`${apiUrl}/recommendations/stats`, {
        headers: { cookie },
      }),
      axios.get<RecommendationsResponse>(`${apiUrl}/recommendations?limit=5`, {
        headers: { cookie },
      }),
      axios.get<AgentRunStatsResponse>(`${apiUrl}/agent-runs/stats`, {
        headers: { cookie },
      }),
      axios.get<AgentRunsResponse>(`${apiUrl}/agent-runs?limit=5`, {
        headers: { cookie },
      }),
      axios.get<AgentConfigResponse>(`${apiUrl}/agent-config`, {
        headers: { cookie },
      }),
    ]);

    recommendationStats = recommendationStatsResponse.data.stats;
    recommendations = recommendationsResponse.data.recommendations;
    agentRunStats = agentRunStatsResponse.data.stats;
    agentRuns = agentRunsResponse.data.agentRuns;
    agentConfigs = agentConfigResponse.data.configs;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load dashboard.";
  }

  const primaryAgentConfig =
    agentConfigs.find((config) => config.configType === "general") ??
    agentConfigs[0] ??
    null;

  const liveRun = agentRuns[0] ?? null;

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

      <LiveRunBanner initialRun={liveRun} />

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
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {stat.detail}
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
        <Card className="border-border/60 hover:border-primary/30 transition-colors group">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">
                  Next Agent Run
                </p>
                <p className="text-2xl font-bold text-foreground truncate">
                  <NextRunCountdown
                    nextRunAt={primaryAgentConfig?.nextRunAt ?? null}
                  />
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {formatDateTime(primaryAgentConfig?.nextRunAt ?? null)}
                </p>
              </div>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 group-hover:scale-105 transition-transform -mt-6 md:-mt-1">
                <Clock className="size-4 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
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
            {recommendations.length === 0 ? (
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
                              asChild
                            >
                              <a
                                href={recommendation.issue.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Open issue in new tab"
                              >
                                <ExternalLink className="size-3.5" />
                              </a>
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
                {agentRuns.length === 0 ? (
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
