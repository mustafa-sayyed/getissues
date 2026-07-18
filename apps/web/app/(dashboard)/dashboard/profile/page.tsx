import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Link as LinkIcon,
  GitPullRequest,
  CircleDot,
  Calendar,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { authClient, User } from "@/lib/auth-client";
import { GithubUserData, IssueOrPullRequestResponse } from "@/types";
import Link from "next/link";
import { SlUserFollow, SlUserFollowing } from "react-icons/sl";
import { GoRepo } from "react-icons/go";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import axios from "axios";

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

const getStatus = (issue: IssueOrPullRequestResponse): string => {
  if (issue.state === "open") return "open";

  if (issue.pull_request) {
    return issue.pull_request.merged_at ? "merged" : "closed";
  }

  return "closed";
};

export default async function ProfilePage() {
  let user: User | null = null;
  let githubData: GithubUserData | null = null;
  let error;

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

  user = session.user;

  try {
    const { data } = await axios.get<GithubUserData>(
      `${process.env.NEXT_PUBLIC_API_URL}/users/github/${session.user.id}`,
      {
        headers: {
          cookie,
        },
      },
    );
    githubData = data;
  } catch (err) {
    console.log(err);
    error = err instanceof Error ? err.message : "Failed to fetch user data.";
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-md">
        <h2 className="text-lg font-semibold">Error</h2>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Avatar className="size-30 ring-3 ring-background">
              <AvatarImage src={user?.image as string} alt="User" />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {user?.name[0] ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-2xl text-foreground">{user?.name}</h1>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {githubData?.bio ?? "No bio available."}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" /> {githubData?.location}
                </span>
                <Link
                  href={(githubData?.html_url as string) ?? ""}
                  target="_blank"
                  className="flex items-center gap-1 hover:underline"
                >
                  <LinkIcon className="size-3" />{" "}
                  {githubData?.blog ?? "No Portfolio Website"}
                </Link>
                <Link
                  href={(githubData?.html_url as string) ?? ""}
                  className="flex items-center gap-1 hover:underline"
                  target="_blank"
                >
                  <FaGithub className="size-3" /> {githubData?.login}
                </Link>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" /> Joined at{" "}
                  {new Date(githubData?.created_at ?? 0).toLocaleDateString()}
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
            label: "Total Issues and PR created",
            value: githubData?.pullRequests.total_count ?? "0",
            icon: CircleDot,
            color: "text-primary bg-primary/10",
          },
          {
            label: "Public Repos",
            value: githubData?.public_repos ?? "0",
            icon: GoRepo,
            color: "text-violet-500 bg-violet-500/10",
          },
          {
            label: "Followers",
            value: githubData?.followers ?? "0",
            icon: SlUserFollow,
            color: "text-yellow-500 bg-yellow-500/10",
          },
          {
            label: "Following",
            value: githubData?.following ?? "0",
            icon: SlUserFollowing,
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
            {githubData?.pullRequests.items.slice(0, 8).map((issue, i) => (
              <Link
                key={i}
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0 group cursor-pointer hover:bg-muted/30 rounded-lg px-2 transition-colors"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
                  {issue.pull_request?.url ? (
                    <GitPullRequest className="size-3.5 text-muted-foreground" />
                  ) : (
                    <CircleDot className="size-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {issue.title}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {issue.repository_url.split("repos")[1].slice(1)}{" "}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${statusConfig[getStatus(issue)]?.color}`}
                  >
                    {statusConfig[getStatus(issue)]?.label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {issue.created_at
                      ? new Date(issue.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
