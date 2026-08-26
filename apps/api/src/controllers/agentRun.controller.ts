import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "../lib/db.ts";
import { asyncHandler } from "../utils/asyncRequest.ts";
import { httpStatusCodes } from "../utils/httpStatusCodes.ts";
import ApiError from "../utils/ApiError.ts";

const getAgentRuns = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const requestedLimit = Number(req.query.limit);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100)
    : 10;

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
    .where(eq(schema.agentRuns.userId, req.user.id))
    .groupBy(
      schema.agentRuns.id,
      schema.agentRuns.status,
      schema.agentRuns.startedAt,
      schema.agentRuns.endedAt,
    )
    .orderBy(desc(schema.agentRuns.startedAt))
    .limit(limit);

  return res.status(httpStatusCodes.OK).json({
    agentRuns,
    meta: { limit },
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

  const evaluations = await db
    .select({
      id: schema.agentIssueEvaluation.id,
      matchScore: schema.agentIssueEvaluation.matchScore,
      reason: schema.agentIssueEvaluation.reason,
      evaluatedAt: schema.agentIssueEvaluation.createdAt,
      recommendation: {
        id: schema.recommendations.id,
        status: schema.recommendations.status,
      },
      issue: {
        id: schema.issue.id,
        githubId: schema.issue.githubId,
        title: schema.issue.title,
        description: schema.issue.description,
        state: schema.issue.status,
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
    .leftJoin(
      schema.recommendations,
      and(
        eq(schema.recommendations.issueId, schema.agentIssueEvaluation.issueId),
        eq(schema.recommendations.agentRunId, schema.agentIssueEvaluation.agentId),
      ),
    )
    .where(
      and(
        eq(schema.agentIssueEvaluation.agentId, runId),
        eq(schema.agentIssueEvaluation.userId, req.user.id),
      ),
    )
    .orderBy(desc(schema.agentIssueEvaluation.matchScore));

  return res.status(httpStatusCodes.OK).json({
    run,
    evaluations,
  });
});

export { getAgentRuns, getAgentRunStats, getAgentRun };
