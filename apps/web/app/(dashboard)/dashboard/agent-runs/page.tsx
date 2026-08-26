"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  LoaderCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type RunStatus = "success" | "failed" | "running";

type AgentRun = {
  id: string;
  status: RunStatus;
  startedAt: string | null;
  endedAt: string | null;
  recommendationsCreated: number;
};

type AgentRunsResponse = {
  agentRuns: AgentRun[];
};

type AgentRunStats = {
  total: number;
  successful: number;
  failed: number;
  running: number;
  lastRun: {
    id: string;
    status: RunStatus;
    startedAt: string | null;
    endedAt: string | null;
  } | null;
};

type StatsResponse = {
  stats: AgentRunStats;
};

const runStatusConfig: Record<
  RunStatus,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  success: {
    label: "Success",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0",
    icon: <CheckCircle2 className="size-3.5" />,
  },
  failed: {
    label: "Failed",
    badgeClass: "bg-red-500/15 text-red-600 dark:text-red-400 border-0",
    icon: <XCircle className="size-3.5" />,
  },
  running: {
    label: "Running",
    badgeClass: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-0",
    icon: <LoaderCircle className="size-3.5 animate-spin" />,
  },
};

const formatDateTime = (value: string | null) => {
  if (!value) return "N/A";

  return new Date(value).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDuration = (run: { startedAt: string | null; endedAt: string | null }) => {
  if (!run.startedAt || !run.endedAt) return null;

  const durationMs = new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime();

  if (Number.isNaN(durationMs) || durationMs < 0) return null;

  const seconds = Math.round(durationMs / 1000);

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

export default function AgentRunsPage() {
  const router = useRouter();
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [stats, setStats] = useState<AgentRunStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [runsResponse, statsResponse] = await Promise.all([
        api.get<AgentRunsResponse>("/agent-runs?limit=50"),
        api.get<StatsResponse>("/agent-runs/stats"),
      ]);

      setRuns(runsResponse.data.agentRuns);
      setStats(statsResponse.data.stats);
    } catch {
      setError("Failed to fetch agent runs.");
      toast.error("Failed to fetch agent runs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const statCards = [
    { label: "Total runs", value: stats?.total ?? 0, icon: <Activity className="size-4" /> },
    { label: "Successful", value: stats?.successful ?? 0, icon: <CheckCircle2 className="size-4 text-emerald-500" /> },
    { label: "Failed", value: stats?.failed ?? 0, icon: <XCircle className="size-4 text-red-500" /> },
    { label: "Running", value: stats?.running ?? 0, icon: <LoaderCircle className="size-4 text-sky-500" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Runs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your recommendation agent runs and see what it evaluated
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => void fetchData()}
          disabled={isLoading}
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="border-border/60 py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                {card.icon}
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs text-muted-foreground">
                  {card.label}
                </div>
                <div className="text-xl font-bold text-foreground">
                  {isLoading ? "-" : card.value}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.lastRun && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-primary" />
              Last run
            </CardTitle>
            <CardDescription>
              Most recent recommendation agent run
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Badge
              className={`gap-1 px-2 py-0.5 text-[10px] ${runStatusConfig[stats.lastRun.status].badgeClass}`}
            >
              {runStatusConfig[stats.lastRun.status].icon}
              {runStatusConfig[stats.lastRun.status].label}
            </Badge>
            <span className="text-muted-foreground">
              Started {formatDateTime(stats.lastRun.startedAt)}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto h-8 gap-1.5"
              onClick={() => router.push(`/dashboard/agent-runs/${stats.lastRun!.id}`)}
            >
              View details
              <ArrowRight className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border/60 py-16 text-sm text-muted-foreground">
          <Spinner />
          Loading agent runs...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : runs.length === 0 ? (
        <div className="rounded-lg border border-border/60 p-10 text-center">
          <Bot className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-3 text-sm font-semibold text-foreground">
            No agent runs yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your recommendation agent runs will appear here once they start.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {runs.map((run) => (
            <Card
              key={run.id}
              className="cursor-pointer border-border/60 transition-colors hover:bg-muted/20"
              onClick={() => router.push(`/dashboard/agent-runs/${run.id}`)}
            >
              <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                <Badge
                  className={`gap-1 px-2 py-0.5 text-[10px] ${runStatusConfig[run.status].badgeClass}`}
                >
                  {runStatusConfig[run.status].icon}
                  {runStatusConfig[run.status].label}
                </Badge>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">
                    Run {formatDateTime(run.startedAt)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {run.recommendationsCreated}{" "}
                    {run.recommendationsCreated === 1
                      ? "recommendation"
                      : "recommendations"}{" "}
                    created
                    {formatDuration(run)
                      ? ` · took ${formatDuration(run)}`
                      : ""}
                  </div>
                </div>

                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
