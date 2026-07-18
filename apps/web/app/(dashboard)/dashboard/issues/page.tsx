"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  ExternalLink,
  Star,
  ChevronDown,
  CircleDot,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";

type IssueStatus = "open" | "closed" | "assigned";
type SearchMode = "keyword" | "semantic";

type Issue = {
  id: string;
  title: string;
  description: string | null;
  body: string | null;
  status: IssueStatus;
  url: string;
  isAssigned: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  similarity?: number;
  repo: {
    githubRepoId: string | null;
    name: string | null;
    repoUrl: string | null;
    languages: string[] | null;
    stars: number | null;
    description: string | null;
  } | null;
};

type IssuesResponse = {
  issues: Issue[];
  meta?: {
    searchMode: SearchMode;
    limit: number;
  };
};

const statusColor: Record<IssueStatus, string> = {
  open: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0",
  assigned: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0",
  closed: "bg-muted text-muted-foreground border-0",
};

const langColor: Record<string, string> = {
  // Top Web & General Purpose
  typescript: "bg-[#3178c6] text-white",
  javascript: "bg-[#f1e05a] text-black",
  python: "bg-[#3572A5] text-white",
  rust: "bg-[#dea584] text-black",
  go: "bg-[#00ADD8] text-black",
  java: "bg-[#b07219] text-white",
  php: "bg-[#4F5D95] text-white",
  ruby: "bg-[#701516] text-white",
  dart: "bg-[#00B4AB] text-black",
  swift: "bg-[#F05138] text-white",
  kotlin: "bg-[#A97BFF] text-white",

  // C Systems & Native Languages
  c: "bg-[#555555] text-white",
  "c++": "bg-[#f34b7d] text-white",
  "c#": "bg-[#178600] text-white",
  zig: "bg-[#ec915c] text-black",
  nim: "bg-[#37775b] text-white",

  // Frontend & Styling
  html: "bg-[#e34c26] text-white",
  css: "bg-[#563d7c] text-white",
  scss: "bg-[#c6538c] text-white",
  less: "bg-[#1d365d] text-white",
  vue: "bg-[#41b883] text-black",
  svelte: "bg-[#ff3e00] text-white",

  // Functional & Data Science
  elixir: "bg-[#6e4a7e] text-white",
  haskell: "bg-[#5e5086] text-white",
  clojure: "bg-[#db5855] text-white",
  scala: "bg-[#c22d40] text-white",
  erlang: "bg-[#B83998] text-white",
  ocaml: "bg-[#ef7a08] text-white",
  r: "bg-[#198CE7] text-white",
  julia: "bg-[#a270ba] text-white",

  // Shell, Config & Scripting
  shell: "bg-[#89e051] text-black",
  powershell: "bg-[#012456] text-white",
  makefile: "bg-[#427819] text-white",
  dockerfile: "bg-[#384d54] text-white",
  nix: "bg-[#7e7eff] text-black",
  lua: "bg-[#000080] text-white",
  perl: "bg-[#0298c3] text-white",
  markdown: "bg-[#083fa1] text-white",
  mdx: "bg-[#fcb32c] text-black",

  // Database & Logic
  sql: "bg-[#e38c00] text-black",
  plsql: "bg-[#E0A818] text-black",
  assembly: "bg-[#6E4C13] text-white",

  // Fallback default catch-all
  default: "bg-[#64748b] text-white",
};

const searchModes: Array<{ value: SearchMode; label: string }> = [
  { value: "keyword", label: "Keyword" },
  { value: "semantic", label: "Semantic" },
];

const limits = [10, 25, 50, 100] as const;

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

const formatStatus = (status: IssueStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default function IssuesPage() {
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("keyword");
  const [limit, setLimit] = useState<(typeof limits)[number]>(50);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: String(limit),
        searchMode,
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const { data } = await axios.get<IssuesResponse>(
        `${apiUrl}/issues?${params.toString()}`,
        {
          withCredentials: true,
        },
      );
      setIssues(data.issues);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch issues.");
    } finally {
      setIsLoading(false);
    }
  }, [limit, search, searchMode]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchIssues();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [fetchIssues]);

  const visibleIssues = useMemo(() => issues, [issues]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Issues</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Disconver Issues semantically or keyword based
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder={
              searchMode === "semantic"
                ? "Describe the issue you want to work on..."
                : "Search issues or repositories..."
            }
            className="pl-8 h-9 bg-muted/40 border-border/60 focus-visible:ring-primary/40 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Filter className="size-3.5" />
                {searchModes.find((mode) => mode.value === searchMode)?.label}
                <ChevronDown className="size-3.5 ml-auto opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuLabel className="text-xs">
                Search type
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {searchModes.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSearchMode(option.value)}
                  className={
                    searchMode === option.value ? "bg-muted font-medium" : ""
                  }
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                Limit
                <Badge className="ml-1 text-[10px] px-1 py-0 bg-muted text-muted-foreground border-0">
                  {limit}
                </Badge>
                <ChevronDown className="size-3.5 ml-auto opacity-50" />
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
            onClick={() => void fetchIssues()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CircleDot className="size-5 text-primary" />
          <span>
            <strong className="text-foreground">
              {isLoading ? 0 : visibleIssues.length}
            </strong>{" "}
            issues found
          </span>
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[40%] font-semibold text-xs uppercase tracking-wide px-8">
                Issue
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide hidden md:table-cell">
                Repository
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide lg:table-cell">
                Languages
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide">
                Status
              </TableHead>
              <TableHead className="w-20 font-semibold text-xs uppercase tracking-wide md:table-cell text-right">
                Stars
              </TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-16 text-muted-foreground text-sm"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Spinner /> Loading issues...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-16 text-red-600 dark:text-red-400 text-sm"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : visibleIssues.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-16 text-muted-foreground text-sm"
                >
                  No issues found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              visibleIssues.map((issue) => {
                const primaryLanguage = issue.repo?.languages?.[0] ?? "Other";
                const repoName = issue.repo?.name ?? "Unknown repository";

                return (
                  <TableRow
                    key={issue.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() =>
                      window.open(issue.url, "_blank", "noopener,noreferrer")
                    }
                  >
                    <TableCell className="py-3.5 px-7">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <CircleDot className="size-5 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors whitespace-break-spaces">
                            {issue.title}
                          </p>
                          <p className="text-xs text-muted-foreground md:hidden mt-0.5">
                            {repoName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {searchMode === "semantic" &&
                            typeof issue.similarity === "number"
                              ? `${Math.round(issue.similarity * 100)}% match`
                              : formatRelativeTime(issue.createdAt)}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`size-2 rounded-full ${langColor[primaryLanguage] ?? "bg-muted-foreground"}`}
                        />
                        <span className="text-sm text-muted-foreground font-mono text-xs">
                          {repoName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(issue.repo?.languages?.length
                          ? issue.repo.languages.slice(0, 3)
                          : ["Unknown"]
                        ).map((language) => (
                          <span
                            key={language}
                            className={`text-[10px] px-1.5 py-0.5 border ${langColor[language.toLowerCase()]} rounded-full font-medium`}
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`text-[10px] px-2 py-0.5 font-medium ${statusColor[issue.status]}`}
                      >
                        {formatStatus(issue.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="md:table-cell text-right">
                      <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="size-3" />
                          {((issue.repo?.stars ?? 0) / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(event) => {
                          event.stopPropagation();
                          window.open(
                            issue.url,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                      >
                        <ExternalLink className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
