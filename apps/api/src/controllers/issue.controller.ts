import { and, desc, ilike, or, sql, type SQL } from "drizzle-orm";
import { ApiLogger as logger } from "@packages/logging";
import { db, schema, eq } from "../lib/db.ts";
import { embedText, toPgVector } from "../lib/ai.ts";
import { asyncHandler } from "../utils/asyncRequest.ts";
import { httpStatusCodes } from "../utils/httpStatusCodes.ts";
import ApiError from "../utils/ApiError.ts";

const searchModes = ["keyword", "semantic"] as const;
type SearchMode = (typeof searchModes)[number];

const getQueryEmbedding = async (query: string) => {
  const embedding = await embedText(query);

  if (!embedding?.length) {
    logger.error({ query }, "Failed to generate embedding for issue search");
    return null;
  }

  return toPgVector(embedding);
};

const getIssues = asyncHandler(async (req, res) => {
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const searchMode = searchModes.includes(req.query.searchMode as SearchMode)
    ? (req.query.searchMode as SearchMode)
    : "keyword";

  const requestedLimit = Number(req.query.limit);

  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100)
    : 50;

  const filters: SQL[] = [];

  if (search && searchMode === "keyword") {
    const searchPattern = `%${search}%`;
    const searchFilter = or(
      ilike(schema.issue.title, searchPattern),
      ilike(schema.issue.description, searchPattern),
      ilike(schema.repoAnalysis.name, searchPattern),
    );

    if (searchFilter) {
      filters.push(searchFilter);
    }
  }

  if (search && searchMode === "semantic") {
    const queryEmbedding = await getQueryEmbedding(search);

    if (!queryEmbedding) {
      throw new ApiError(
        httpStatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to search issues. Please try again later.",
      );
    }

    filters.push(sql`${schema.issue.embedding} IS NOT NULL`);

    const issues = await db
      .select({
        id: schema.issue.id,
        title: schema.issue.title,
        description: schema.issue.description,
        body: schema.issue.body,
        status: schema.issue.status,
        url: schema.issue.url,
        isAssigned: schema.issue.isAssigned,
        createdAt: schema.issue.createdAt,
        updatedAt: schema.issue.updatedAt,
        similarity: sql<number>`1 - (${schema.issue.embedding} <=> ${queryEmbedding}::vector)`,
        repo: {
          githubRepoId: schema.repoAnalysis.githubRepoId,
          name: schema.repoAnalysis.name,
          repoUrl: schema.repoAnalysis.repoUrl,
          languages: schema.repoAnalysis.languages,
          stars: schema.repoAnalysis.stars,
          description: schema.repoAnalysis.description,
        },
      })
      .from(schema.issue)
      .leftJoin(
        schema.repoAnalysis,
        eq(schema.issue.githubRepoId, schema.repoAnalysis.githubRepoId),
      )
      .where(and(...filters))
      .orderBy(sql`${schema.issue.embedding} <=> ${queryEmbedding}::vector`)
      .limit(limit);

    return res.status(httpStatusCodes.OK).json({
      issues,
      meta: { searchMode, limit },
    });
  }

  const issues = await db
    .select({
      id: schema.issue.id,
      title: schema.issue.title,
      description: schema.issue.description,
      body: schema.issue.body,
      status: schema.issue.status,
      url: schema.issue.url,
      isAssigned: schema.issue.isAssigned,
      createdAt: schema.issue.createdAt,
      updatedAt: schema.issue.updatedAt,
      repo: {
        githubRepoId: schema.repoAnalysis.githubRepoId,
        name: schema.repoAnalysis.name,
        repoUrl: schema.repoAnalysis.repoUrl,
        languages: schema.repoAnalysis.languages,
        stars: schema.repoAnalysis.stars,
        description: schema.repoAnalysis.description,
      },
    })
    .from(schema.issue)
    .leftJoin(
      schema.repoAnalysis,
      eq(schema.issue.githubRepoId, schema.repoAnalysis.githubRepoId),
    )
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(schema.issue.createdAt))
    .limit(limit);

  return res.status(httpStatusCodes.OK).json({
    issues,
    meta: { searchMode, limit },
  });
});

export { getIssues };
