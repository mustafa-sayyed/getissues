import { and, desc, eq, isNull, lt, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "../lib/db.ts";
import { asyncHandler } from "../utils/asyncRequest.ts";
import { httpStatusCodes } from "../utils/httpStatusCodes.ts";
import ApiError from "../utils/ApiError.ts";

const getAgentRuns = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const limit = typeof req.query.limit === "number" ? req.query.limit : 20;
  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : null;

  // Cursor is a run id: page backwards from that run's start time.
  let cursorFilter: SQL | undefined;
  if (cursor) {
    const [cursorRow] = await db
      .select({
        id: schema.agentRuns.id,
        startedAt: schema.agentRuns.startedAt,
      })
      .from(schema.agentRuns)
      .where(
        and(
          eq(schema.agentRuns.id, cursor),
          eq(schema.agentRuns.userId, req.user.id),
        ),
      )
      .limit(1);

    if (cursorRow) {
      cursorFilter = cursorRow.startedAt
        ? or(
            lt(schema.agentRuns.startedAt, cursorRow.startedAt),
            and(
              eq(schema.agentRuns.startedAt, cursorRow.startedAt),
              lt(schema.agentRuns.id, cursorRow.id),
            ),
          )
        : and(
            isNull(schema.agentRuns.startedAt),
            lt(schema.agentRuns.id, cursorRow.id),
          );
    }
  }

  const agentRuns = await db
    .select({
      id: schema.agentRuns.id,
      status: schema.agentRuns.status,
      startedAt: schema.agentRuns.startedAt,
      endedAt: schema.agentRuns.endedAt,
      recommendationsCreated: sql<number>`count(${schema.recommendations.id})::int`,
    })
    .from(schema.agentRuns)
    .leftJoin(
      schema.recommendations,
      eq(schema.recommendations.agentRunId, schema.agentRuns.id),
    )
    .where(
      and(eq(schema.agentRuns.userId, req.user.id), cursorFilter),
    )
    .groupBy(
      schema.agentRuns.id,
      schema.agentRuns.status,
      schema.agentRuns.startedAt,
      schema.agentRuns.endedAt,
    )
    .orderBy(
      sql`${schema.agentRuns.startedAt} desc nulls last`,
      desc(schema.agentRuns.id),
    )
    .limit(limit + 1);

  const hasMore = agentRuns.length > limit;
  const page = hasMore ? agentRuns.slice(0, limit) : agentRuns;

  return res.status(httpStatusCodes.OK).json({
    agentRuns: page,
    meta: {
      limit,
      hasMore,
      nextCursor: hasMore ? (page[page.length - 1]?.id ?? null) : null,
    },
  });
});

const getAgentRunStats = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      successful: sql<number>`count(*) filter (where ${schema.agentRuns.status} = 'success')::int`,
      failed: sql<number>`count(*) filter (where ${schema.agentRuns.status} = 'failed')::int`,
      running: sql<number>`count(*) filter (where ${schema.agentRuns.status} = 'running')::int`,
    })
    .from(schema.agentRuns)
    .where(eq(schema.agentRuns.userId, req.user.id));

  const [lastRun] = await db
    .select({
      id: schema.agentRuns.id,
      status: schema.agentRuns.status,
      startedAt: schema.agentRuns.startedAt,
      endedAt: schema.agentRuns.endedAt,
    })
    .from(schema.agentRuns)
    .where(eq(schema.agentRuns.userId, req.user.id))
    .orderBy(desc(schema.agentRuns.startedAt))
    .limit(1);

  return res.status(httpStatusCodes.OK).json({
    stats: {
      total: stats?.total ?? 0,
      successful: stats?.successful ?? 0,
      failed: stats?.failed ?? 0,
      running: stats?.running ?? 0,
      lastRun: lastRun ?? null,
    },
  });
});

const getAgentRun = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const runId = req.params.runId as string;

  const [run] = await db
    .select({
      id: schema.agentRuns.id,
      status: schema.agentRuns.status,
      startedAt: schema.agentRuns.startedAt,
      endedAt: schema.agentRuns.endedAt,
      recommendationsCreated: sql<number>`(
        select count(*)::int from ${schema.recommendations}
        where ${schema.recommendations.agentRunId} = ${schema.agentRuns.id}
      )`,
    })
    .from(schema.agentRuns)
    .where(
      and(
        eq(schema.agentRuns.id, runId),
        eq(schema.agentRuns.userId, req.user.id),
      ),
    )
    .limit(1);

  if (!run) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, "Agent run not found");
  }

  const evaluatedIssues = await db
    .select({
      id: schema.agentIssueEvaluation.id,
      matchScore: schema.agentIssueEvaluation.matchScore,
      reason: schema.agentIssueEvaluation.reason,
      evaluatedAt: schema.agentIssueEvaluation.createdAt,
      issue: {
        id: schema.issue.id,
        githubId: schema.issue.githubId,
        title: schema.issue.title,
        description: schema.issue.description,
        status: schema.issue.status,
        url: schema.issue.url,
        isAssigned: schema.issue.isAssigned,
      },
      repo: {
        name: schema.repoAnalysis.name,
        repoUrl: schema.repoAnalysis.repoUrl,
        languages: schema.repoAnalysis.languages,
        stars: schema.repoAnalysis.stars,
      },
    })
    .from(schema.agentIssueEvaluation)
    .innerJoin(
      schema.issue,
      eq(schema.agentIssueEvaluation.issueId, schema.issue.id),
    )
    .leftJoin(
      schema.repoAnalysis,
      eq(schema.issue.githubRepoId, schema.repoAnalysis.githubRepoId),
    )
    .where(
      and(
        eq(schema.agentIssueEvaluation.agentId, runId),
        eq(schema.agentIssueEvaluation.userId, req.user.id),
      ),
    );

  // Issues recommended by this run live in `recommendations`, not in
  // `agent_issue_evaluation` (only below-threshold issues are stored there),
  // so fetch both sides and merge into one chronological list.
  const recommendedIssues = await db
    .select({
      id: schema.recommendations.id,
      matchScore: schema.recommendations.matchScore,
      reason: schema.recommendations.reason,
      evaluatedAt: schema.recommendations.recommendedAt,
      recommendationStatus: schema.recommendations.status,
      issue: {
        id: schema.issue.id,
        githubId: schema.issue.githubId,
        title: schema.issue.title,
        description: schema.issue.description,
        status: schema.issue.status,
        url: schema.issue.url,
        isAssigned: schema.issue.isAssigned,
      },
      repo: {
        name: schema.repoAnalysis.name,
        repoUrl: schema.repoAnalysis.repoUrl,
        languages: schema.repoAnalysis.languages,
        stars: schema.repoAnalysis.stars,
      },
    })
    .from(schema.recommendations)
    .innerJoin(
      schema.issue,
      eq(schema.recommendations.issueId, schema.issue.id),
    )
    .leftJoin(
      schema.repoAnalysis,
      eq(schema.issue.githubRepoId, schema.repoAnalysis.githubRepoId),
    )
    .where(
      and(
        eq(schema.recommendations.agentRunId, runId),
        eq(schema.recommendations.userId, req.user.id),
      ),
    );

  const recommendedIssueIds = new Set(
    recommendedIssues.map((item) => item.issue.id),
  );

  const evaluations = [
    ...recommendedIssues.map((item) => ({
      id: item.id,
      matchScore: item.matchScore,
      reason: item.reason,
      evaluatedAt: item.evaluatedAt,
      recommendation: {
        id: item.id,
        status: item.recommendationStatus,
      },
      issue: item.issue,
      repo: item.repo,
    })),
    ...evaluatedIssues
      .filter((item) => !recommendedIssueIds.has(item.issue.id))
      .map((item) => ({ ...item, recommendation: null })),
  ].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  return res.status(httpStatusCodes.OK).json({
    run,
    evaluations,
  });
});

export { getAgentRuns, getAgentRunStats, getAgentRun };
