import { db, schema, count, eq, desc, sql } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  GitPullRequest, 
  Database, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Bookmark, 
  Eye, 
  Star,
  TrendingUp,
  AlertTriangle,
  FileCode2,
  RefreshCcw
} from "lucide-react";

export const revalidate = 0; // Disable static caching for live analytics

export default async function AdminDashboardPage() {
  let stats = {
    totalUsers: 0,
    totalIssues: 0,
    openIssues: 0,
    closedIssues: 0,
    assignedIssues: 0,
    totalRepos: 0,
    totalAgentRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    runningRuns: 0,
    totalRecommendations: 0,
    bookmarkedRecommendations: 0,
    viewedRecommendations: 0,
  };

  let recentUsers: Array<typeof schema.user.$inferSelect> = [];
  let recentRuns: Array<typeof schema.agentRuns.$inferSelect & { userName?: string }> = [];
  let topRepos: Array<typeof schema.repoAnalysis.$inferSelect> = [];
  let recentIssues: Array<typeof schema.issue.$inferSelect> = [];

  let dbConnected = true;
  let errorMessage = "";

  try {
    const [
      [usersCountRes],
      [issuesCountRes],
      [openIssuesRes],
      [closedIssuesRes],
      [assignedIssuesRes],
      [reposCountRes],
      [runsCountRes],
      [successRunsRes],
      [failedRunsRes],
      [runningRunsRes],
      [recsCountRes],
      [bookmarkedRecsRes],
      [viewedRecsRes],
    ] = await Promise.all([
      db.select({ count: count() }).from(schema.user),
      db.select({ count: count() }).from(schema.issue),
      db.select({ count: count() }).from(schema.issue).where(eq(schema.issue.status, "open")),
      db.select({ count: count() }).from(schema.issue).where(eq(schema.issue.status, "closed")),
      db.select({ count: count() }).from(schema.issue).where(eq(schema.issue.status, "assigned")),
      db.select({ count: count() }).from(schema.repoAnalysis),
      db.select({ count: count() }).from(schema.agentRuns),
      db.select({ count: count() }).from(schema.agentRuns).where(eq(schema.agentRuns.status, "success")),
      db.select({ count: count() }).from(schema.agentRuns).where(eq(schema.agentRuns.status, "failed")),
      db.select({ count: count() }).from(schema.agentRuns).where(eq(schema.agentRuns.status, "running")),
      db.select({ count: count() }).from(schema.recommendations),
      db.select({ count: count() }).from(schema.recommendations).where(eq(schema.recommendations.status, "bookmarked")),
      db.select({ count: count() }).from(schema.recommendations).where(eq(schema.recommendations.status, "viewed")),
    ]);

    stats = {
      totalUsers: usersCountRes?.count ?? 0,
      totalIssues: issuesCountRes?.count ?? 0,
      openIssues: openIssuesRes?.count ?? 0,
      closedIssues: closedIssuesRes?.count ?? 0,
      assignedIssues: assignedIssuesRes?.count ?? 0,
      totalRepos: reposCountRes?.count ?? 0,
      totalAgentRuns: runsCountRes?.count ?? 0,
      successfulRuns: successRunsRes?.count ?? 0,
      failedRuns: failedRunsRes?.count ?? 0,
      runningRuns: runningRunsRes?.count ?? 0,
      totalRecommendations: recsCountRes?.count ?? 0,
      bookmarkedRecommendations: bookmarkedRecsRes?.count ?? 0,
      viewedRecommendations: viewedRecsRes?.count ?? 0,
    };

    // Fetch lists for detailed views
    recentUsers = await db.select().from(schema.user).orderBy(desc(schema.user.createdAt)).limit(5);

    const runsData = await db
      .select({
        run: schema.agentRuns,
        user: schema.user,
      })
      .from(schema.agentRuns)
      .leftJoin(schema.user, eq(schema.agentRuns.userId, schema.user.id))
      .orderBy(desc(schema.agentRuns.startedAt))
      .limit(8);

    recentRuns = runsData.map(({ run, user }) => ({
      ...run,
      userName: user?.name ?? "Unknown User",
    }));

    topRepos = await db
      .select()
      .from(schema.repoAnalysis)
      .orderBy(desc(schema.repoAnalysis.stars))
      .limit(6);

    recentIssues = await db
      .select()
      .from(schema.issue)
      .orderBy(desc(schema.issue.createdAt))
      .limit(6);

  } catch (err: any) {
    dbConnected = false;
    errorMessage = err?.message || "Failed to query database";
  }

  const successRate = stats.totalAgentRuns > 0 
    ? Math.round((stats.successfulRuns / stats.totalAgentRuns) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            System Analytics Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time telemetry and database insights directly powered by Neon & Drizzle ORM
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={dbConnected ? "outline" : "destructive"} className="py-1.5 px-3 font-medium flex items-center gap-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            Direct DB Active
          </Badge>
        </div>
      </div>

      {!dbConnected && (
        <Card className="border-destructive/50 bg-destructive/10 text-destructive-foreground">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-base font-semibold">Database Connection Warning</CardTitle>
              <CardDescription className="text-xs text-destructive/80">
                {errorMessage}. Ensure <code className="bg-background/40 px-1 py-0.5 rounded text-foreground">DATABASE_URL</code> is properly set in your environment.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Main KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-card/80 via-card to-secondary/20 border-border/50 shadow-sm relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="h-16 w-16 text-indigo-400" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400" /> Total Registered Users
            </CardDescription>
            <CardTitle className="text-3xl font-black">{stats.totalUsers.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-emerald-400 gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5" /> Active accounts on platform
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card/80 via-card to-secondary/20 border-border/50 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <GitPullRequest className="h-16 w-16 text-purple-400" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <GitPullRequest className="h-4 w-4 text-purple-400" /> Total Issues Ingested
            </CardDescription>
            <CardTitle className="text-3xl font-black">{stats.totalIssues.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-emerald-400 font-medium">{stats.openIssues} Open</span>
              <span>•</span>
              <span className="text-sky-400 font-medium">{stats.assignedIssues} Assigned</span>
              <span>•</span>
              <span className="text-neutral-400">{stats.closedIssues} Closed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card/80 via-card to-secondary/20 border-border/50 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database className="h-16 w-16 text-emerald-400" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" /> Repos Analyzed
            </CardDescription>
            <CardTitle className="text-3xl font-black">{stats.totalRepos.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-emerald-400 gap-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Repository metadata & vector embeddings
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card/80 via-card to-secondary/20 border-border/50 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Bot className="h-16 w-16 text-amber-400" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Bot className="h-4 w-4 text-amber-400" /> Agent Executions
            </CardDescription>
            <CardTitle className="text-3xl font-black">{stats.totalAgentRuns.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {successRate}% Success
              </span>
              <span className="text-destructive flex items-center gap-1">
                <XCircle className="h-3 w-3" /> {stats.failedRuns} Failed
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/40 bg-card/60 backdrop-blur-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Recommendations Delivered</CardTitle>
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecommendations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Matched issues to user profiles via agent evaluations
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Bookmarked Issues</CardTitle>
            <Bookmark className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookmarkedRecommendations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Saved by users for active resolution
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Viewed Recommendations</CardTitle>
            <Eye className="h-4 w-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.viewedRecommendations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Engaged by developer community
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs View */}
      <Tabs defaultValue="runs" className="w-full space-y-6">
        <TabsList className="bg-secondary/40 border border-border/40 p-1">
          <TabsTrigger value="runs" className="gap-2">
            <Bot className="h-4 w-4" /> Recent Agent Runs
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" /> Latest Users
          </TabsTrigger>
          <TabsTrigger value="repos" className="gap-2">
            <Database className="h-4 w-4" /> Top Repositories
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <GitPullRequest className="h-4 w-4" /> Recent Issues
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Recent Agent Runs */}
        <TabsContent value="runs">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-amber-400" /> Operational Logs: Recent Agent Runs
              </CardTitle>
              <CardDescription>
                Detailed status of issue search and matching agent executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentRuns.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No agent runs recorded in the database yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started At</TableHead>
                      <TableHead>Ended At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRuns.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {run.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">{run.userName}</TableCell>
                        <TableCell>
                          {run.status === "success" && (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Success
                            </Badge>
                          )}
                          {run.status === "failed" && (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                              <XCircle className="h-3 w-3 mr-1" /> Failed
                            </Badge>
                          )}
                          {run.status === "running" && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                              <RefreshCcw className="h-3 w-3 mr-1 animate-spin" /> Running
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {run.startedAt ? new Date(run.startedAt).toLocaleString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {run.endedAt ? new Date(run.endedAt).toLocaleString() : "In progress"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Latest Users */}
        <TabsContent value="users">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" /> Community: Registered Developers
              </CardTitle>
              <CardDescription>
                Latest user registrations and GitHub profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No registered users found in the database.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>GitHub ID</TableHead>
                      <TableHead>Email Verified</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatarUrl} alt={u.name} />
                            <AvatarFallback>{u.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <span>{u.name}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-xs font-mono">{u.githubId || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={u.emailVerified ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-secondary text-muted-foreground"}>
                            {u.emailVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Top Repositories */}
        <TabsContent value="repos">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-400" /> Knowledge Base: Analyzed Repositories
              </CardTitle>
              <CardDescription>
                Top repositories ranked by GitHub stars and documentation metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topRepos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No repository analysis records found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Repository</TableHead>
                      <TableHead>Stars</TableHead>
                      <TableHead>Doc Score</TableHead>
                      <TableHead>Contributor Score</TableHead>
                      <TableHead>Analyzed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topRepos.map((repo) => (
                      <TableRow key={repo.githubRepoId}>
                        <TableCell className="font-medium">
                          <a href={repo.repoUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1.5 text-indigo-400">
                            {repo.name}
                          </a>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-1 text-amber-400">
                            <Star className="h-3.5 w-3.5 fill-amber-400" /> {repo.stars.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-sky-500/10 text-sky-400 border-sky-500/30">
                            {repo.documentationScore ?? "N/A"}/100
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            {repo.contributorFriendliness ?? "N/A"}/100
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {repo.lastAnalyzedAt ? new Date(repo.lastAnalyzedAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Recent Issues */}
        <TabsContent value="issues">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GitPullRequest className="h-5 w-5 text-purple-400" /> Ingested Issues Feed
              </CardTitle>
              <CardDescription>
                Recent GitHub issues analyzed and embedded for developer matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentIssues.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No issues recorded in database.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Ingested At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentIssues.map((iss) => (
                      <TableRow key={iss.id}>
                        <TableCell className="font-medium max-w-xs truncate">{iss.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            iss.status === "open" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                            iss.status === "assigned" ? "bg-sky-500/10 text-sky-400 border-sky-500/30" :
                            "bg-neutral-500/10 text-neutral-400 border-neutral-500/30"
                          }>
                            {iss.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {iss.isAssigned ? "Yes" : "No"}
                        </TableCell>
                        <TableCell>
                          <a href={iss.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">
                            View GitHub
                          </a>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {iss.createdAt ? new Date(iss.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
