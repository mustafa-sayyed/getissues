import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  MapPin,
  Link as LinkIcon,
  Code2,
  Star,
  GitPullRequest,
  CircleDot,
  Edit3,
  Calendar,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";

const skills = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Tailwind CSS",
  "PostgreSQL",
  "GraphQL",
  "Docker",
];

const contributions = [
  {
    repo: "vercel/next.js",
    type: "PR Merged",
    title: "Fix hydration mismatch",
    date: "2 weeks ago",
    status: "merged",
  },
  {
    repo: "shadcn-ui/ui",
    type: "Issue Opened",
    title: "Request: Add Combobox to registry",
    date: "1 month ago",
    status: "open",
  },
  {
    repo: "prisma/prisma",
    type: "PR Merged",
    title: "Update type definitions for raw queries",
    date: "2 months ago",
    status: "merged",
  },
  {
    repo: "colinhacks/zod",
    type: "PR Closed",
    title: "Add support for discriminated optional unions",
    date: "3 months ago",
    status: "closed",
  },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  merged: {
    color:
      "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
    label: "Merged",
  },
  open: {
    color:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    label: "Open",
  },
  closed: {
    color: "bg-muted text-muted-foreground border-border/60",
    label: "Closed",
  },
};

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header */}
      <Card className="border-border/60 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/30 via-primary/20 to-secondary/40" />
        <CardContent className="pt-0 px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <Avatar className="size-20 ring-4 ring-background">
              <AvatarImage src="/avatars/01.png" alt="User" />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    User Name
                  </h1>
                  <p className="text-sm text-muted-foreground">@username</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                >
                  <Edit3 className="size-3.5" />
                  Edit Profile
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Open source enthusiast | TypeScript & React developer | Love
                building things that matter
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" /> San Francisco, CA
                </span>
                <span className="flex items-center gap-1">
                  <LinkIcon className="size-3" /> portfolio.dev
                </span>
                <span className="flex items-center gap-1">
                  <FaGithub className="size-3" /> github.com/username
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" /> Joined June 2025
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Issues Matched",
            value: "128",
            icon: CircleDot,
            color: "text-primary bg-primary/10",
          },
          {
            label: "PRs Submitted",
            value: "12",
            icon: GitPullRequest,
            color: "text-violet-500 bg-violet-500/10",
          },
          {
            label: "Repos Starred",
            value: "247",
            icon: Star,
            color: "text-yellow-500 bg-yellow-500/10",
          },
          {
            label: "Languages",
            value: "8",
            icon: Code2,
            color: "text-blue-500 bg-blue-500/10",
          },
        ].map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`flex size-9 items-center justify-center rounded-xl ${s.color.split(" ")[1]}`}
              >
                <s.icon className={`size-4 ${s.color.split(" ")[0]}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Skills */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Code2 className="size-4 text-primary" />
              Skills & Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-xs px-2.5 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-default"
                >
                  {skill}
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 h-7 text-xs text-muted-foreground"
            >
              + Add skills
            </Button>
          </CardContent>
        </Card>

        {/* GitHub Activity */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FaGithub className="size-4 text-primary" />
              GitHub Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "Public Repos", value: "34" },
                { label: "Total Stars", value: "1.2k" },
                { label: "Followers", value: "128" },
                { label: "Following", value: "89" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full gap-1.5 text-xs"
            >
              <FaGithub className="size-3.5" />
              View on GitHub
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Contributions */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GitPullRequest className="size-4 text-primary" />
            Recent Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {contributions.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0 group cursor-pointer hover:bg-muted/30 rounded-lg px-2 transition-colors"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
                  {c.type.includes("PR") ? (
                    <GitPullRequest className="size-3.5 text-muted-foreground" />
                  ) : (
                    <CircleDot className="size-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {c.title}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {c.repo}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${statusConfig[c.status]?.color}`}
                  >
                    {statusConfig[c.status]?.label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {c.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
