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
  GitFork,
  ChevronDown,
  CircleDot,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

const allIssues = [
  {
    id: 1,
    title: "Fix hydration mismatch in SSR rendering",
    repo: "vercel/next.js",
    labels: ["bug", "good first issue"],
    language: "TypeScript",
    stars: 120000,
    forks: 26000,
    difficulty: "Easy",
    status: "Open",
    time: "2h ago",
  },
  {
    id: 2,
    title: "Add dark mode support to UI components",
    repo: "shadcn-ui/ui",
    labels: ["enhancement", "help wanted"],
    language: "TypeScript",
    stars: 74000,
    forks: 4500,
    difficulty: "Medium",
    status: "Open",
    time: "4h ago",
  },
  {
    id: 3,
    title: "Improve TypeScript type inference for generics",
    repo: "microsoft/TypeScript",
    labels: ["suggestion"],
    language: "TypeScript",
    stars: 98000,
    forks: 12600,
    difficulty: "Hard",
    status: "Open",
    time: "6h ago",
  },
  {
    id: 4,
    title: "Update documentation for React hooks",
    repo: "facebook/react",
    labels: ["documentation"],
    language: "JavaScript",
    stars: 227000,
    forks: 46500,
    difficulty: "Easy",
    status: "Open",
    time: "8h ago",
  },
  {
    id: 5,
    title: "Add Zod v4 validation support",
    repo: "colinhacks/zod",
    labels: ["enhancement", "good first issue"],
    language: "TypeScript",
    stars: 33000,
    forks: 1200,
    difficulty: "Medium",
    status: "Open",
    time: "12h ago",
  },
  {
    id: 6,
    title: "Performance regression in animation loop",
    repo: "framer/motion",
    labels: ["bug"],
    language: "TypeScript",
    stars: 24000,
    forks: 800,
    difficulty: "Hard",
    status: "Open",
    time: "1d ago",
  },
  {
    id: 7,
    title: "Refactor CSS variable tokens to use new format",
    repo: "tailwindlabs/tailwindcss",
    labels: ["enhancement"],
    language: "JavaScript",
    stars: 84000,
    forks: 4100,
    difficulty: "Easy",
    status: "Open",
    time: "1d ago",
  },
  {
    id: 8,
    title: "Fix edge case in query builder null handling",
    repo: "prisma/prisma",
    labels: ["bug", "help wanted"],
    language: "TypeScript",
    stars: 38000,
    forks: 1500,
    difficulty: "Medium",
    status: "Open",
    time: "2d ago",
  },
];

const difficultyColor: Record<string, string> = {
  Easy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0",
  Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0",
  Hard: "bg-red-500/15 text-red-600 dark:text-red-400 border-0",
};

const labelColor: Record<string, string> = {
  "good first issue": "bg-primary/10 text-primary border-primary/20",
  bug: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  enhancement:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  "help wanted":
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  documentation:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  suggestion: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
};

const langColor: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Rust: "bg-orange-600",
};

const difficulties = ["All", "Easy", "Medium", "Hard"];

export default function IssuesPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");

  const filtered = allIssues.filter((issue) => {
    const matchSearch =
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.repo.toLowerCase().includes(search.toLowerCase());
    const matchDiff = difficulty === "All" || issue.difficulty === difficulty;
    return matchSearch && matchDiff;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Issues</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-curated open source issues matched to your profile
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search issues or repositories..."
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
                Difficulty
                {difficulty !== "All" && (
                  <Badge
                    className={`ml-1 text-[10px] px-1 py-0 ${difficultyColor[difficulty]}`}
                  >
                    {difficulty}
                  </Badge>
                )}
                <ChevronDown className="size-3.5 ml-auto opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuLabel className="text-xs">
                Filter by difficulty
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {difficulties.map((d) => (
                <DropdownMenuItem
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={difficulty === d ? "bg-muted font-medium" : ""}
                >
                  {d}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="h-9 gap-1.5">
            <RefreshCw className="size-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CircleDot className="size-3.5 text-primary" />
          <span>
            <strong className="text-foreground">{filtered.length}</strong>{" "}
            issues found
          </span>
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[40%] font-semibold text-xs uppercase tracking-wide">
                Issue
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide hidden md:table-cell">
                Repository
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">
                Labels
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide">
                Difficulty
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide hidden md:table-cell text-right">
                Stats
              </TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-16 text-muted-foreground text-sm"
                >
                  No issues found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((issue) => (
                <TableRow
                  key={issue.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <TableCell className="py-3.5">
                    <div className="flex items-start gap-2.5">
                      <CircleDot className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {issue.title}
                        </p>
                        <p className="text-xs text-muted-foreground md:hidden mt-0.5">
                          {issue.repo}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {issue.time}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`size-2 rounded-full ${langColor[issue.language] ?? "bg-muted-foreground"}`}
                      />
                      <span className="text-sm text-muted-foreground font-mono text-xs">
                        {issue.repo}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {issue.labels.map((label) => (
                        <Badge
                          key={label}
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${labelColor[label] ?? ""}`}
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={`text-[10px] px-2 py-0.5 font-medium ${difficultyColor[issue.difficulty]}`}
                    >
                      {issue.difficulty}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-right">
                    <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="size-3" />
                        {(issue.stars / 1000).toFixed(0)}k
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="size-3" />
                        {(issue.forks / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
