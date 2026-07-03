import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "../lib/db.js";
import { asyncHandler } from "../utils/asyncRequest.js";
import { httpStatusCodes } from "../utils/httpStatusCodes.js";

const getAgentRuns = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized" });
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
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized" });
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

export { getAgentRuns, getAgentRunStats };
