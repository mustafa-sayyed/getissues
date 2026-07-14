import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { ApiLogger as logger } from "@packages/logging";
import { db, schema } from "../lib/db.js";
import { asyncHandler } from "../utils/asyncRequest.js";
import { captureRecommendationDecision } from "../utils/cognee.js";
import { httpStatusCodes } from "../utils/httpStatusCodes.js";

const recommendationStatuses = [
  "notviewed",
  "viewed",
  "bookmarked",
  "deleted",
] as const;

type RecommendationStatus = (typeof recommendationStatuses)[number];

const getRecommendationDecisionSnapshot = async (
  recommendationId: string,
  userId: string,
) => {
  const [recommendation] = await db
    .select({
      id: schema.recommendations.id,
      reason: schema.recommendations.reason,
      matchScore: schema.recommendations.matchScore,
      status: schema.recommendations.status,
      issue: {
        title: schema.issue.title,
        description: schema.issue.description,
        url: schema.issue.url,
      },
      repo: {
        name: schema.repoAnalysis.name,
        repoUrl: schema.repoAnalysis.repoUrl,
        languages: schema.repoAnalysis.languages,
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
    .where(
      and(
        eq(schema.recommendations.id, recommendationId),
        eq(schema.recommendations.userId, userId),
      ),
    )
    .limit(1);

  return recommendation;
};

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

const getRecommendation = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized" });
  }

  const recommendationId = req.params.recommendationId as string;

  const [recommendation] = await db
    .select({
      id: schema.recommendations.id,
      reason: schema.recommendations.reason,
      matchScore: schema.recommendations.matchScore,
      status: schema.recommendations.status,
      recommendedAt: schema.recommendations.recommendedAt,
      issue: {
        id: schema.issue.id,
        githubId: schema.issue.githubId,
        title: schema.issue.title,
        description: schema.issue.description,
        body: schema.issue.body,
        status: schema.issue.status,
        url: schema.issue.url,
        isAssigned: schema.issue.isAssigned,
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
        documentationScore: schema.repoAnalysis.documentationScore,
        contributorFriendliness: schema.repoAnalysis.contributorFriendliness,
        maintainerResponsiveness: schema.repoAnalysis.maintainerResponsiveness,
        lastActivityAt: schema.repoAnalysis.lastActivityAt,
        isActive: schema.repoAnalysis.isActive,
        isLessCrowded: schema.repoAnalysis.isLessCrowded,
        lastAnalyzedAt: schema.repoAnalysis.lastAnalyzedAt,
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
        eq(schema.recommendations.id, recommendationId),
        eq(schema.recommendations.userId, req.user.id),
      ),
    )
    .limit(1);

  if (!recommendation) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ error: "Recommendation not found" });
  }

  return res.status(httpStatusCodes.OK).json({ recommendation });
});

const updateRecommendationStatus = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized" });
  }

  const recommendationId = req.params.recommendationId as string;
  const status = req.body.status as RecommendationStatus;

  if (!recommendationStatuses.includes(status)) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json({ error: "Invalid recommendation status" });
  }

  const [recommendation] = await db
    .update(schema.recommendations)
    .set({ status })
    .where(
      and(
        eq(schema.recommendations.id, recommendationId),
        eq(schema.recommendations.userId, req.user.id),
      ),
    )
    .returning({
      id: schema.recommendations.id,
      status: schema.recommendations.status,
    });

  if (!recommendation) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ error: "Recommendation not found" });
  }

  const decisionSnapshot = await getRecommendationDecisionSnapshot(
    recommendation.id,
    req.user.id,
  );

  if (decisionSnapshot) {
    captureRecommendationDecision({
      userId: req.user.id,
      recommendationId: decisionSnapshot.id,
      status: decisionSnapshot.status,
      matchScore: decisionSnapshot.matchScore,
      reason: decisionSnapshot.reason,
      issueTitle: decisionSnapshot.issue.title,
      issueDescription: decisionSnapshot.issue.description,
      issueUrl: decisionSnapshot.issue.url,
      repoName: decisionSnapshot.repo?.name ?? null,
      repoUrl: decisionSnapshot.repo?.repoUrl ?? null,
      repoLanguages: decisionSnapshot.repo?.languages ?? null,
      repoDescription: decisionSnapshot.repo?.description ?? null,
    }).catch((error) => {
      logger.error({ error }, "Failed to capture recommendation decision in Cognee.");
    });
  }

  return res.status(httpStatusCodes.OK).json({ recommendation });
});

export {
  getRecommendations,
  getRecommendationStats,
  getRecommendation,
  updateRecommendationStatus,
};
