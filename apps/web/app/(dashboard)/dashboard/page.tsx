import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bot,
  CircleDot,
  Flame,
  Sprout,
  Clock,
  Star,
  GitFork,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    label: "Issues Matched",
    value: "128",
    delta: "+12 today",
    icon: CircleDot,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "AI Suggestions",
    value: "34",
    delta: "+5 this week",
    icon: Bot,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    label: "Hacktoberfest",
    value: "7",
    delta: "eligible issues",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    label: "GSSoC Issues",
    value: "15",
    delta: "open for you",
    icon: Sprout,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const recentIssues = [
  {
    id: 1,
    title: "Fix hydration mismatch in SSR rendering",
    repo: "vercel/next.js",
    labels: ["bug", "good first issue"],
    stars: 120000,
    forks: 26000,
    difficulty: "Easy",
    time: "2h ago",
  },
  {
    id: 2,
    title: "Add dark mode support to UI components",
    repo: "shadcn-ui/ui",
    labels: ["enhancement", "help wanted"],
    stars: 74000,
    forks: 4500,
    difficulty: "Medium",
    time: "4h ago",
  },
  {
    id: 3,
    title: "Improve TypeScript type inference for generics",
    repo: "microsoft/TypeScript",
    labels: ["suggestion", "good first issue"],
    stars: 98000,
    forks: 12600,
    difficulty: "Hard",
    time: "6h ago",
  },
  {
    id: 4,
    title: "Update documentation for React hooks",
    repo: "facebook/react",
    labels: ["documentation"],
    stars: 227000,
    forks: 46500,
    difficulty: "Easy",
    time: "8h ago",
  },
];

const difficultyColor: Record<string, string> = {
  Easy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Hard: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const labelColor: Record<string, string> = {
  "good first issue":
    "bg-primary/10 text-primary dark:text-primary border-primary/20",
  bug: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  enhancement:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  "help wanted":
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  documentation:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  suggestion: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
};

export default function DashboardHomePage() {
  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/60 hover:border-primary/30 transition-colors group"
          >
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.delta}</p>
                </div>
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Issues */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Recent Matched Issues
            </h2>
            <p className="text-sm text-muted-foreground">
              Hand-picked by your AI agent
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/issues" className="flex items-center gap-1">
              View all
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-3">
          {recentIssues.map((issue) => (
            <Card
              key={issue.id}
              className="border-border/60 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 mt-0.5 items-center justify-center rounded-lg bg-primary/10">
                    <CircleDot className="size-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {issue.title}
                      </h3>
                      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {issue.repo}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {issue.labels.map((label) => (
                        <Badge
                          key={label}
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 font-medium border ${labelColor[label] ?? ""}`}
                        >
                          {label}
                        </Badge>
                      ))}
                      <Badge
                        className={`text-[10px] px-1.5 py-0 font-medium border-0 ${difficultyColor[issue.difficulty]}`}
                      >
                        {issue.difficulty}
                      </Badge>
                      <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Star className="size-3" />
                          {(issue.stars / 1000).toFixed(0)}k
                        </span>
                        <span className="flex items-center gap-0.5">
                          <GitFork className="size-3" />
                          {(issue.forks / 1000).toFixed(1)}k
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="size-3" />
                          {issue.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
