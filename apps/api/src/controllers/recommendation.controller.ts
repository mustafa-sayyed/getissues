import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "../lib/db.js";
import { asyncHandler } from "../utils/asyncRequest.js";
import { httpStatusCodes } from "../utils/httpStatusCodes.js";

const recommendationStatuses = [
  "notviewed",
  "viewed",
  "bookmarked",
  "deleted",
] as const;

type RecommendationStatus = (typeof recommendationStatuses)[number];

const getRecommendations = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized" });
  }

  const status = typeof req.query.status === "string" ? req.query.status : "";
  const requestedLimit = Number(req.query.limit);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100)
    : 50;

  const statusFilter = recommendationStatuses.includes(
    status as RecommendationStatus,
  )
    ? eq(schema.recommendations.status, status as RecommendationStatus)
    : inArray(schema.recommendations.status, [
        "notviewed",
        "viewed",
        "bookmarked",
      ]);

  const recommendations = await db
    .select({
      id: schema.recommendations.id,
      reason: schema.recommendations.reason,
      matchScore: schema.recommendations.matchScore,
      status: schema.recommendations.status,
      recommendedAt: schema.recommendations.recommendedAt,
      issue: {
        id: schema.issue.id,
        title: schema.issue.title,
        description: schema.issue.description,
        body: schema.issue.body,
        status: schema.issue.status,
        url: schema.issue.url,
        createdAt: schema.issue.createdAt,
        updatedAt: schema.issue.updatedAt,
      },
      repo: {
        githubRepoId: schema.repoAnalysis.githubRepoId,
        name: schema.repoAnalysis.name,
        repoUrl: schema.repoAnalysis.repoUrl,
        languages: schema.repoAnalysis.languages,
        stars: schema.repoAnalysis.stars,
        description: schema.repoAnalysis.description,
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
    .where(and(eq(schema.recommendations.userId, req.user.id), statusFilter))
    .orderBy(desc(schema.recommendations.recommendedAt))
    .limit(limit);

  return res.status(httpStatusCodes.OK).json({
    recommendations,
    meta: { limit },
  });
});

const getRecommendationStats = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized" });
  }

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      newCount: sql<number>`count(*) filter (where ${schema.recommendations.status} = 'notviewed')::int`,
      bookmarkedCount: sql<number>`count(*) filter (where ${schema.recommendations.status} = 'bookmarked')::int`,
      averageMatchScore: sql<number>`avg(${schema.recommendations.matchScore})::real`,
    })
    .from(schema.recommendations)
    .where(
      and(
        eq(schema.recommendations.userId, req.user.id),
        inArray(schema.recommendations.status, [
          "notviewed",
          "viewed",
          "bookmarked",
        ]),
      ),
    );

  return res.status(httpStatusCodes.OK).json({
    stats: {
      total: stats?.total ?? 0,
      newCount: stats?.newCount ?? 0,
      bookmarkedCount: stats?.bookmarkedCount ?? 0,
      averageMatchScore: stats?.averageMatchScore ?? null,
    },
  });
});

export { getRecommendations, getRecommendationStats };
