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
import {
  ArrowLeft,
  Bookmark,
  CircleDot,
  ExternalLink,
  GitBranch,
  Sparkles,
  Star,
  ThumbsDown,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
    githubId: number | null;
    title: string;
    description: string | null;
    body: string | null;
    status: IssueStatus;
    url: string;
    isAssigned: boolean | null;
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
    documentationScore: number | null;
    contributorFriendliness: number | null;
    maintainerResponsiveness: number | null;
    lastActivityAt: string | null;
    isActive: boolean | null;
    isLessCrowded: boolean | null;
    lastAnalyzedAt: string | null;
  } | null;
};

type RecommendationResponse = {
  recommendation: Recommendation;
};

const issueStatusColor: Record<IssueStatus, string> = {
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

const formatStatus = (status: string) => {
  if (status === "notviewed") return "New";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatScore = (score: number | null) => {
  if (typeof score !== "number") return "N/A";
  return `${Math.round(score * 100)}%`;
};

const formatDate = (value: string | null) => {
  if (!value) return "N/A";

  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            {children}
          </a>
        ),
        h1: ({ children }) => (
          <h1 className="mt-5 text-xl font-semibold text-foreground first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-5 text-lg font-semibold text-foreground first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-4 text-base font-semibold text-foreground first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="my-3 leading-6 first:mt-0 last:mb-0">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>
        ),
        li: ({ children }) => <li className="pl-1">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-2 border-border pl-3 text-muted-foreground">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="my-3 overflow-x-auto rounded-md border border-border/60 bg-muted/50 p-3 text-xs text-foreground">
            {children}
          </pre>
        ),
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto rounded-md border border-border/60">
            <table className="w-full border-collapse text-left text-xs">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-border/60 bg-muted/50 px-3 py-2 font-semibold text-foreground">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-border/40 px-3 py-2">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function RecommendationDetailPage() {
  const router = useRouter();
  const params = useParams<{ recommendationId: string }>();
  const recommendationId = params.recommendationId;

  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRecommendationStatus = useCallback(
    async (status: RecommendationStatus, showToast = true) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) return;

      setIsUpdating(true);

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
          throw new Error(
            `Failed to update recommendation (${response.status})`,
          );
        }

        setRecommendation((current) =>
          current ? { ...current, status } : current,
        );

        if (showToast) {
          toast.success(
            status === "bookmarked"
              ? "Recommendation bookmarked."
              : "Recommendation updated.",
          );
        }
      } catch (err) {
        console.error("Error updating recommendation:", err);
        if (showToast) {
          toast.error("Failed to update recommendation.");
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [recommendationId],
  );

  const fetchRecommendation = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiUrl}/recommendations/${recommendationId}`,
        { credentials: "include" },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendation (${response.status})`);
      }

      const data = (await response.json()) as RecommendationResponse;
      setRecommendation(data.recommendation);

      if (data.recommendation.status === "notviewed") {
        void updateRecommendationStatus("viewed", false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch recommendation.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [recommendationId, updateRecommendationStatus]);

  useEffect(() => {
    void fetchRecommendation();
  }, [fetchRecommendation]);

  const languages = recommendation?.repo?.languages?.length
    ? recommendation.repo.languages
    : ["Unknown"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 h-8 gap-1.5 px-0 text-muted-foreground hover:bg-transparent"
            onClick={() => router.push("/dashboard/recommendations")}
          >
            <ArrowLeft className="size-3.5" />
            Back to recommendations
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {recommendation?.issue.title ?? "Recommendation Detail"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review the issue, repository context, and AI match reason
          </p>
        </div>

        {recommendation && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              disabled={isUpdating}
              onClick={() => void updateRecommendationStatus("bookmarked")}
            >
              <Bookmark className="size-3.5" />
              Bookmark
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
              disabled={isUpdating}
              onClick={() => void updateRecommendationStatus("deleted")}
            >
              <ThumbsDown className="size-3.5" />
              Not interested
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border/60 py-16 text-sm text-muted-foreground">
          <Spinner />
          Loading recommendation...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : recommendation ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Card className="border-border/60">
              <CardHeader className="gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardDescription className="flex items-center gap-2">
                    <CircleDot className="size-4 shrink-0 text-primary" />
                    Recommended {formatDate(recommendation.recommendedAt)}
                  </CardDescription>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Badge
                      className={`text-[10px] px-2 py-0.5 ${recommendationStatusColor[recommendation.status]}`}
                    >
                      {formatStatus(recommendation.status)}
                    </Badge>
                    <Badge
                      className={`text-[10px] px-2 py-0.5 ${issueStatusColor[recommendation.issue.status]}`}
                    >
                      {formatStatus(recommendation.issue.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {recommendation.issue.description && (
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      Description
                    </h2>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <MarkdownContent
                        content={recommendation.issue.description}
                      />
                    </div>
                  </div>
                )}

                {recommendation.issue.body && (
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      Issue details
                    </h2>
                    <div className="mt-2 max-h-[520px] overflow-auto rounded-md border border-border/60 bg-muted/30 p-4 pr-3 text-sm text-muted-foreground [scrollbar-color:hsl(var(--muted-foreground)/0.35)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50 [&::-webkit-scrollbar-track]:bg-transparent">
                      <MarkdownContent content={recommendation.issue.body} />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" className="h-8 gap-1.5">
                    <Link
                      href={recommendation.issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-3.5" />
                      Open issue
                    </Link>
                  </Button>
                  {recommendation.repo?.repoUrl && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                    >
                      <Link
                        href={recommendation.repo.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GitBranch className="size-3.5" />
                        Open repository
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {recommendation.reason && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Sparkles className="size-4" />
                    </span>
                    Why this matches you
                  </CardTitle>
                  <CardDescription>AI recommendation insight</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-7 text-foreground">
                    {recommendation.reason}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Match</CardTitle>
                <CardDescription>
                  AI confidence and recommendation status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Match score</span>
                  <span className="font-semibold text-foreground">
                    {formatScore(recommendation.matchScore)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assigned</span>
                  <span className="font-semibold text-foreground">
                    {recommendation.issue.isAssigned ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Issue created</span>
                  <span className="font-semibold text-foreground">
                    {formatDate(recommendation.issue.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Repository</CardTitle>
                <CardDescription>
                  {recommendation.repo?.name ?? "Unknown repository"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendation.repo?.description && (
                  <p className="text-sm text-muted-foreground">
                    {recommendation.repo.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {languages.map((language) => (
                    <span
                      key={language}
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${langColor[language.toLowerCase()] ?? langColor.default}`}
                    >
                      {language}
                    </span>
                  ))}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Stars</span>
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Star className="size-3.5" />
                      {(recommendation.repo?.stars ?? 0).toLocaleString()}
                    </span>
                  </div>
                  {/* <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Docs score</span>
                    <span className="font-semibold text-foreground">
                      {recommendation.repo?.documentationScore ?? "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Contributor friendly
                    </span>
                    <span className="font-semibold text-foreground">
                      {recommendation.repo?.contributorFriendliness ?? "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Maintainer response
                    </span>
                    <span className="font-semibold text-foreground">
                      {recommendation.repo?.maintainerResponsiveness ?? "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last activity</span>
                    <span className="font-semibold text-foreground">
                      {formatDate(recommendation.repo?.lastActivityAt ?? null)}
                    </span>
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
