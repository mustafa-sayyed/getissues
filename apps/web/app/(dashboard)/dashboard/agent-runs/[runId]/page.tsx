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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  ExternalLink,
  GitBranch,
  LoaderCircle,
  Sparkles,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type RunStatus = "success" | "failed" | "running";
type IssueStatus = "open" | "closed" | "assigned";

type AgentRunDetail = {
  id: string;
  status: RunStatus;
  startedAt: string | null;
  endedAt: string | null;
  recommendationsCreated: number;
};

type Evaluation = {
  id: string;
  matchScore: number;
  reason: string | null;
  evaluatedAt: string | null;
  recommendation: {
    id: string;
    status: "notviewed" | "viewed" | "bookmarked" | "deleted" | null;
  } | null;
  issue: {
    id: string;
    githubId: number | null;
    title: string;
    description: string | null;
    state: IssueStatus;
    url: string;
    isAssigned: boolean | null;
  };
  repo: {
    name: string | null;
    repoUrl: string | null;
    languages: string[] | null;
    stars: number | null;
  } | null;
};

type AgentRunResponse = {
  run: AgentRunDetail;
  evaluations: Evaluation[];
};

const formatScore = (score: number) => `${Math.round(score * 100)}%`;

const scoreColor = (score: number) => {
  if (score >= 0.8) return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  if (score >= 0.5) return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-muted text-muted-foreground";
};

export default function AgentRunDetailPage() {
  const router = useRouter();
  const params = useParams<{ runId: string }>();
  const runId = params.runId;

  const [data, setData] = useState<AgentRunResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRun = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<AgentRunResponse>(`/agent-runs/${runId}`);
      setData(response.data);
    } catch {
      setError("Failed to fetch agent run details.");
    } finally {
      setIsLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    void fetchRun();
  }, [fetchRun]);

  const summary = useMemo(() => {
    const evaluations = data?.evaluations ?? [];

    return {
      total: evaluations.length,
      recommended: evaluations.filter((item) => item.recommendation).length,
      rejected: evaluations.filter((item) => !item.recommendation).length,
      averageScore:
        evaluations.length > 0
          ? evaluations.reduce((sum, item) => sum + item.matchScore, 0) /
            evaluations.length
          : null,
    };
  }, [data]);

  const runStatusBadge = (status: RunStatus) => {
    if (status === "running") {
      return (
        <Badge className="gap-1 bg-sky-500/15 px-2 py-0.5 text-[10px] text-sky-600 dark:text-sky-400">
          <LoaderCircle className="size-3 animate-spin" />
          Running
        </Badge>
      );
    }

    if (status === "failed") {
      return (
        <Badge className="gap-1 bg-red-500/15 px-2 py-0.5 text-[10px] text-red-600 dark:text-red-400">
          <XCircle className="size-3" />
          Failed
        </Badge>
      );
    }

    return (
      <Badge className="gap-1 bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-3" />
        Success
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 h-8 gap-1.5 px-0 text-muted-foreground hover:bg-transparent"
          onClick={() => router.push("/dashboard/agent-runs")}
        >
          <ArrowLeft className="size-3.5" />
          Back to agent runs
        </Button>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
          Agent Run Details
          {isLoading ? (
            <Skeleton className="h-5 w-16 rounded-full" />
          ) : (
            runStatusBadge(data?.run.status ?? "running")
          )}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Issues the agent searched and evaluated during this run
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border/60 py-16 text-sm text-muted-foreground">
          <Spinner />
          Loading run details...
        </div>
      ) : error || !data ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-600 dark:text-red-400">
          {error ?? "Agent run not found."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card className="border-border/60 py-4">
              <CardContent className="px-4">
                <div className="text-xs text-muted-foreground">Evaluated</div>
                <div className="text-xl font-bold">{summary.total}</div>
              </CardContent>
            </Card>
            <Card className="border-border/60 py-4">
              <CardContent className="px-4">
                <div className="text-xs text-muted-foreground">Recommended</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {summary.recommended}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 py-4">
              <CardContent className="px-4">
                <div className="text-xs text-muted-foreground">Rejected</div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                  {summary.rejected}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 py-4">
              <CardContent className="px-4">
                <div className="text-xs text-muted-foreground">Avg score</div>
                <div className="text-xl font-bold">
                  {summary.averageScore !== null
                    ? formatScore(summary.averageScore)
                    : "N/A"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Evaluated issues</CardTitle>
              <CardDescription>
                LLM scores and reasons for every issue considered in this run
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.evaluations.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No issues were evaluated in this run.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border/60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Issue</TableHead>
                        <TableHead>Repository</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.evaluations.map((evaluation) => (
                        <TableRow key={evaluation.id}>
                          <TableCell className="max-w-64">
                            <a
                              href={evaluation.issue.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-1.5 font-medium hover:text-primary"
                            >
                              <CircleDot className="mt-0.5 size-3.5 shrink-0 text-primary" />
                              <span className="line-clamp-2 min-w-0">
                                {evaluation.issue.title}
                              </span>
                              <ExternalLink className="mt-0.5 size-3 shrink-0 opacity-50" />
                            </a>
                          </TableCell>
                          <TableCell className="max-w-40">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <GitBranch className="size-3 shrink-0" />
                              <span className="truncate">
                                {evaluation.repo?.name ?? "Unknown"}
                              </span>
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`px-2 py-0.5 text-[10px] ${scoreColor(evaluation.matchScore)}`}
                            >
                              {formatScore(evaluation.matchScore)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {evaluation.recommendation ? (
                              <Badge className="gap-1 bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                                <Sparkles className="size-3" />
                                Recommended
                              </Badge>
                            ) : (
                              <Badge className="gap-1 bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                <XCircle className="size-3" />
                                Rejected
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-72">
                            <span className="line-clamp-2 text-xs text-muted-foreground">
                              {evaluation.reason ?? "No reason provided"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {data.evaluations.some((item) => item.recommendation) && (
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <Link href="/dashboard/recommendations">
                      View recommendations
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
