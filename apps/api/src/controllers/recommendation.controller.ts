import { and, desc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { ApiLogger as logger } from "@packages/shared";
import { db, schema } from "../lib/db.ts";
import { asyncHandler } from "../utils/asyncRequest.ts";
import { captureRecommendationDecision } from "../utils/cognee.ts";
import { httpStatusCodes } from "../utils/httpStatusCodes.ts";
import ApiError from "../utils/ApiError.ts";

const recommendationStatuses = [
  "notviewed",
  "viewed",
  "bookmarked",
  "notinterested",
] as const;

type RecommendationStatus = (typeof recommendationStatuses)[number];

const recommendationFeedbacks = ["helpful", "not_helpful"] as const;

type RecommendationFeedback = (typeof recommendationFeedbacks)[number];

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
      feedback: schema.recommendations.feedback,
      dismissReason: schema.recommendations.dismissReason,
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
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const status = typeof req.query.status === "string" ? req.query.status : "";
  const issueStatus =
    typeof req.query.issueStatus === "string" ? req.query.issueStatus : "";

  const requestedLimit = Number(req.query.limit);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100)
    : 50;
    
  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : null;

  const statusFilter = recommendationStatuses.includes(
    status as RecommendationStatus,
  )
    ? eq(schema.recommendations.status, status as RecommendationStatus)
    : inArray(schema.recommendations.status, [
        "notviewed",
        "viewed",
        "bookmarked",
      ]);

  const issueStatusFilter =
    issueStatus === "open" ||
    issueStatus === "closed" ||
    issueStatus === "assigned"
      ? eq(schema.issue.status, issueStatus)
      : undefined;

  // Cursor is a recommendation id: page backwards from its timestamp.
  let cursorTime: Date | null = null;
  let cursorId: string | null = null;
  if (cursor) {
    const [cursorRow] = await db
      .select({
        id: schema.recommendations.id,
        recommendedAt: schema.recommendations.recommendedAt,
      })
      .from(schema.recommendations)
      .where(
        and(
          eq(schema.recommendations.id, cursor),
          eq(schema.recommendations.userId, req.user.id),
        ),
      )
      .limit(1);
    cursorTime = cursorRow?.recommendedAt ?? null;
    cursorId = cursorRow?.id ?? null;
  }

  const cursorFilter =
    cursorTime && cursorId
      ? or(
          lt(schema.recommendations.recommendedAt, cursorTime),
          and(
            eq(schema.recommendations.recommendedAt, cursorTime),
            lt(schema.recommendations.id, cursorId),
          ),
        )
      : undefined;

  const recommendations = await db
    .select({
      id: schema.recommendations.id,
      reason: schema.recommendations.reason,
      matchScore: schema.recommendations.matchScore,
      status: schema.recommendations.status,
      feedback: schema.recommendations.feedback,
      dismissReason: schema.recommendations.dismissReason,
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
    .where(
      and(
        eq(schema.recommendations.userId, req.user.id),
        statusFilter,
        issueStatusFilter,
        cursorFilter,
      ),
    )
    .orderBy(
      desc(schema.recommendations.recommendedAt),
      desc(schema.recommendations.id),
    )
    .limit(limit + 1);

  const hasMore = recommendations.length > limit;
  const page = hasMore ? recommendations.slice(0, limit) : recommendations;

  return res.status(httpStatusCodes.OK).json({
    recommendations: page,
    meta: {
      limit,
      hasMore,
      nextCursor: hasMore ? (page[page.length - 1]?.id ?? null) : null,
    },
  });
});

const getRecommendationStats = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
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

  const [hidden] = await db
    .select({
      notInterestedCount: sql<number>`count(*)::int`,
    })
    .from(schema.recommendations)
    .where(
      and(
        eq(schema.recommendations.userId, req.user.id),
        eq(schema.recommendations.status, "notinterested"),
      ),
    );

  return res.status(httpStatusCodes.OK).json({
    stats: {
      total: stats?.total ?? 0,
      newCount: stats?.newCount ?? 0,
      bookmarkedCount: stats?.bookmarkedCount ?? 0,
      notInterestedCount: hidden?.notInterestedCount ?? 0,
      averageMatchScore: stats?.averageMatchScore ?? null,
    },
  });
});

const getRecommendation = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const recommendationId = req.params.recommendationId as string;

  const [recommendation] = await db
    .select({
      id: schema.recommendations.id,
      reason: schema.recommendations.reason,
      matchScore: schema.recommendations.matchScore,
      status: schema.recommendations.status,
      feedback: schema.recommendations.feedback,
      dismissReason: schema.recommendations.dismissReason,
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
    throw new ApiError(httpStatusCodes.NOT_FOUND, "Recommendation not found");
  }

  return res.status(httpStatusCodes.OK).json({ recommendation });
});

const updateRecommendationStatus = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const recommendationId = req.params.recommendationId as string;
  const status = req.body.status as RecommendationStatus;

  if (!recommendationStatuses.includes(status)) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "Invalid recommendation status",
    );
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
    throw new ApiError(httpStatusCodes.NOT_FOUND, "Recommendation not found");
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
      feedback: decisionSnapshot.feedback,
      dismissReason: decisionSnapshot.dismissReason,
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
      logger.error(
        { error },
        "Failed to capture recommendation decision in Cognee.",
      );
    });
  }

  return res.status(httpStatusCodes.OK).json({ recommendation });
});

const updateRecommendationFeedback = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const recommendationId = req.params.recommendationId as string;
  const feedback =
    req.body.feedback === null
      ? null
      : (req.body.feedback as RecommendationFeedback);
  const dismissReason =
    typeof req.body.dismissReason === "string" && req.body.dismissReason.trim()
      ? req.body.dismissReason.trim().slice(0, 200)
      : null;

  if (
    feedback !== null &&
    !recommendationFeedbacks.includes(feedback as RecommendationFeedback)
  ) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "Invalid recommendation feedback",
    );
  }

  const [recommendation] = await db
    .update(schema.recommendations)
    .set({ feedback, dismissReason })
    .where(
      and(
        eq(schema.recommendations.id, recommendationId),
        eq(schema.recommendations.userId, req.user.id),
      ),
    )
    .returning({
      id: schema.recommendations.id,
      feedback: schema.recommendations.feedback,
      dismissReason: schema.recommendations.dismissReason,
    });

  if (!recommendation) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, "Recommendation not found");
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
      feedback: decisionSnapshot.feedback,
      dismissReason: decisionSnapshot.dismissReason,
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
      logger.error(
        { error },
        "Failed to capture recommendation decision in Cognee.",
      );
    });
  }

  return res.status(httpStatusCodes.OK).json({ recommendation });
});

export {
  getRecommendations,
  getRecommendationStats,
  getRecommendation,
  updateRecommendationStatus,
  updateRecommendationFeedback,
};
