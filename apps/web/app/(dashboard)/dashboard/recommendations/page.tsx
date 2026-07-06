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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  Bot,
  Bookmark,
  ChevronDown,
  CircleDot,
  RefreshCw,
  Star,
  Dot,
  ThumbsDown,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type IssueStatus = "open" | "closed" | "assigned";
type RecommendationStatus = "notviewed" | "viewed" | "bookmarked" | "deleted";

type Recommendation = {
  id: string;
  reason: string | null;
  matchScore: number | null;
  status: RecommendationStatus;
  recommendedAt: string | null;
  issue: {
    id: string;
    title: string;
    description: string | null;
    body: string | null;
    status: IssueStatus;
    url: string;
    createdAt: string | null;
    updatedAt: string | null;
  };
  repo: {
    githubRepoId: string | null;
    name: string | null;
    repoUrl: string | null;
    languages: string[] | null;
    stars: number | null;
    description: string | null;
  } | null;
};

type RecommendationsResponse = {
  recommendations: Recommendation[];
  meta?: {
    limit: number;
  };
};

const limits = [10, 25, 50, 100] as const;

const statusColor: Record<IssueStatus, string> = {
  open: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0",
  assigned: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0",
  closed: "bg-muted text-muted-foreground border-0",
};

const recommendationStatusColor: Record<RecommendationStatus, string> = {
  notviewed: "bg-primary/10 text-primary border-0",
  viewed: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-0",
  bookmarked: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0",
  deleted: "bg-muted text-muted-foreground border-0",
};

const langColor: Record<string, string> = {
  typescript: "bg-[#3178c6] text-white",
  javascript: "bg-[#f1e05a] text-black",
  python: "bg-[#3572A5] text-white",
  rust: "bg-[#dea584] text-black",
  go: "bg-[#00ADD8] text-black",
  java: "bg-[#b07219] text-white",
  html: "bg-[#e34c26] text-white",
  css: "bg-[#563d7c] text-white",
  default: "bg-[#64748b] text-white",
};

const formatIssueStatus = (status: IssueStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const formatRecommendationStatus = (status: RecommendationStatus) => {
  if (status === "notviewed") return "New";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatRelativeTime = (value: string | null) => {
  if (!value) return "Recently";

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs)) return "Recently";

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

export default function RecommendationsPage() {
  const router = useRouter();
  const [limit, setLimit] = useState<(typeof limits)[number]>(25);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: String(limit) });
      const response = await fetch(
        `${apiUrl}/recommendations?${params.toString()}`,
        { credentials: "include" },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations (${response.status})`);
      }

      const data = (await response.json()) as RecommendationsResponse;
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch recommendations.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const updateRecommendationStatus = async (
    recommendationId: string,
    status: RecommendationStatus,
  ) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl || updatingId) return;

    setUpdatingId(recommendationId);

    try {
      const response = await fetch(
        `${apiUrl}/recommendations/${recommendationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update recommendation (${response.status})`);
      }

      setRecommendations((current) =>
        status === "deleted"
          ? current.filter(
              (recommendation) => recommendation.id !== recommendationId,
            )
          : current.map((recommendation) =>
              recommendation.id === recommendationId
                ? { ...recommendation, status }
                : recommendation,
            ),
      );

      toast.success(
        status === "bookmarked"
          ? "Recommendation bookmarked."
          : "Recommendation hidden.",
      );
    } catch (err) {
      console.error("Error updating recommendation:", err);
      toast.error("Failed to update recommendation.");
    } finally {
      setUpdatingId(null);
    }
  };

  const visibleRecommendations = useMemo(
    () => recommendations,
    [recommendations],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            AI Recommendations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Issues recommended by AI Agent based your skills and preferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                Limit
                <Badge className="ml-1 text-[10px] px-1 py-0 bg-muted text-muted-foreground border-0">
                  {limit}
                </Badge>
                <ChevronDown className="size-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-28">
              <DropdownMenuLabel className="text-xs">Results</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {limits.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setLimit(option)}
                  className={limit === option ? "bg-muted font-medium" : ""}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => void fetchRecommendations()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Bot className="size-4 text-primary" />
          <span>
            <strong className="text-foreground">
              {isLoading ? 0 : visibleRecommendations.length}
            </strong>{" "}
            recommendations found
          </span>
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border/60 py-16 text-sm text-muted-foreground">
          <Spinner />
          Loading recommendations...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : visibleRecommendations.length === 0 ? (
        <div className="rounded-lg border border-border/60 p-10 text-center">
          <Bot className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-3 text-sm font-semibold text-foreground">
            No AI recommendations yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your agent recommendations will appear here after a successful run.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {visibleRecommendations.map((recommendation) => {
            const repoName = recommendation.repo?.name ?? "Unknown repository";
            const languages = recommendation.repo?.languages?.length
              ? recommendation.repo.languages.slice(0, 5)
              : ["Unknown"];

            return (
              <Card
                key={recommendation.id}
                className="cursor-pointer border-border/60 transition-colors hover:bg-muted/20"
                onClick={() =>
                  router.push(`/dashboard/recommendations/${recommendation.id}`)
                }
              >
                <CardHeader className="gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CircleDot className="size-4 shrink-0 text-primary" />
                        <span className="min-w-0">
                          {recommendation.issue.title}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-1 font-mono flex items-center gap-1">
                        {repoName} <Dot />{" "}
                        {formatRelativeTime(recommendation.recommendedAt)}
                      </CardDescription>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Badge
                        className={`text-[10px] px-2 py-0.5 ${recommendationStatusColor[recommendation.status]}`}
                      >
                        {formatRecommendationStatus(recommendation.status)}
                      </Badge>
                      <Badge
                        className={`text-[10px] px-2 py-0.5 ${statusColor[recommendation.issue.status]}`}
                      >
                        {formatIssueStatus(recommendation.issue.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {recommendation.reason && (
                    <p className="text-sm text-muted-foreground">
                      {recommendation.reason}
                    </p>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="gap-1 text-[10px] px-2 py-0.5"
                      >
                        <Bookmark className="size-3" />
                        {formatScore(recommendation.matchScore)} match
                      </Badge>
                      <Badge
                        variant="outline"
                        className="gap-1 text-[10px] px-2 py-0.5"
                      >
                        <Star className="size-3" />
                        {((recommendation.repo?.stars ?? 0) / 1000).toFixed(1)}k
                        stars
                      </Badge>
                      <div className="w-full flex items-center gap-2">
                        <span>Repo Languages: </span>
                        <div className="flex items-center gap-1">
                          {languages.map((language) => (
                            <span
                              key={language}
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${langColor[language.toLowerCase()] ?? langColor.default}`}
                            >
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5"
                        disabled={updatingId === recommendation.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          void updateRecommendationStatus(
                            recommendation.id,
                            "bookmarked",
                          );
                        }}
                      >
                        <Bookmark className="size-3.5" />
                        Bookmark
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                        disabled={updatingId === recommendation.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          void updateRecommendationStatus(
                            recommendation.id,
                            "deleted",
                          );
                        }}
                      >
                        <ThumbsDown className="size-3.5" />
                        Not interested
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
