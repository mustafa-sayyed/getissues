import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "./db.ts";
import { embedText, toPgVector } from "./ai.ts";

const assistantModels = [
  { model: "google/gemini-2.5-flash", maxRetries: 1 },
  { model: "groq/openai/gpt-oss-120b", maxRetries: 2 },
  { model: "cloudflare-workers-ai/@cf/openai/gpt-oss-120b" },
];

const createRecommendationsTool = (userId: string) =>
  createTool({
    id: "get-recommendations",
    description:
      "Get issues that have been recommended to this user, optionally filtered by status.",
    inputSchema: z.object({
      status: z
        .enum(["notviewed", "viewed", "bookmarked"])
        .optional()
        .describe("Filter by recommendation status"),
      limit: z.number().int().min(1).max(20).optional(),
    }),
    execute: async (context) => {
      const recommendations = await db
        .select({
          id: schema.recommendations.id,
          status: schema.recommendations.status,
          matchScore: schema.recommendations.matchScore,
          reason: schema.recommendations.reason,
          recommendedAt: schema.recommendations.recommendedAt,
          issue: {
            title: schema.issue.title,
            description: schema.issue.description,
            url: schema.issue.url,
            state: schema.issue.status,
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
            eq(schema.recommendations.userId, userId),
            context.status
              ? eq(schema.recommendations.status, context.status)
              : inArray(schema.recommendations.status, [
                  "notviewed",
                  "viewed",
                  "bookmarked",
                ]),
          ),
        )
        .orderBy(desc(schema.recommendations.recommendedAt))
        .limit(context.limit ?? 10);

      return { recommendations };
    },
  });

const createSearchIssuesTool = (userId: string) =>
  createTool({
    id: "search-issues",
    description:
      "Search indexed GitHub issues by semantic similarity to a natural language query.",
    inputSchema: z.object({
      query: z.string().min(1).describe("What kind of issue to search for"),
      limit: z.number().int().min(1).max(15).optional(),
    }),
    execute: async (context) => {
      const embedding = await embedText(context.query);
      if (!embedding) {
        throw new Error("Failed to generate search embedding");
      }

      const queryVector = toPgVector(embedding);

      const issues = await db
        .select({
          title: schema.issue.title,
          description: schema.issue.description,
          url: schema.issue.url,
          state: schema.issue.status,
          similarity: sql<number>`1 - (${schema.issue.embedding} <=> ${queryVector}::vector)`,
          repo: {
            name: schema.repoAnalysis.name,
            repoUrl: schema.repoAnalysis.repoUrl,
            languages: schema.repoAnalysis.languages,
            stars: schema.repoAnalysis.stars,
          },
        })
        .from(schema.issue)
        .leftJoin(
          schema.repoAnalysis,
          eq(schema.issue.githubRepoId, schema.repoAnalysis.githubRepoId),
        )
        .where(sql`${schema.issue.embedding} IS NOT NULL`)
        .orderBy(sql`${schema.issue.embedding} <=> ${queryVector}::vector`)
        .limit(context.limit ?? 8);

      return { issues };
    },
  });

const createAgentRunStatsTool = (userId: string) =>
  createTool({
    id: "get-agent-run-stats",
    description:
      "Get statistics about the user's recommendation agent runs.",
    inputSchema: z.object({}),
    execute: async () => {
      const [stats] = await db
        .select({
          total: sql<number>`count(*)::int`,
          successful: sql<number>`count(*) filter (where ${schema.agentRuns.status} = 'success')::int`,
          failed: sql<number>`count(*) filter (where ${schema.agentRuns.status} = 'failed')::int`,
          running: sql<number>`count(*) filter (where ${schema.agentRuns.status} = 'running')::int`,
        })
        .from(schema.agentRuns)
        .where(eq(schema.agentRuns.userId, userId));

      return {
        total: stats?.total ?? 0,
        successful: stats?.successful ?? 0,
        failed: stats?.failed ?? 0,
        running: stats?.running ?? 0,
      };
    },
  });

const createUpdatePreferencesTool = (userId: string) =>
  createTool({
    id: "update-preferences",
    description:
      "Save the user's programming languages and interests. Call this whenever the user shares their preferences.",
    inputSchema: z.object({
      languages: z
        .array(z.string())
        .min(1)
        .describe("Programming languages / technologies"),
      interests: z.string().describe("Free-form description of interests"),
    }),
    execute: async (context) => {
      const embedding = await embedText(
        context.languages.join(", ") + "\n\n" + context.interests,
      );

      if (!embedding) {
        throw new Error("Failed to build preference embedding");
      }

      await db
        .insert(schema.skills)
        .values({
          userId,
          languages: context.languages,
          interests: context.interests,
          embedding,
        })
        .onConflictDoUpdate({
          target: schema.skills.userId,
          set: {
            languages: context.languages,
            interests: context.interests,
            embedding,
          },
        });

      return { success: true, languages: context.languages, interests: context.interests };
    },
  });


export const createAssistantAgent = (options: {
  userId: string;
  instructions: string;
}) =>
  new Agent({
    id: "chat-assistant",
    name: "GetIssues Chat Assistant",
    description:
      "Conversational assistant that helps users discover GitHub issues matching their skills and preferences.",
    instructions: options.instructions,
    model: assistantModels,
    tools: {
      get_recommendations: createRecommendationsTool(options.userId),
      search_issues: createSearchIssuesTool(options.userId),
      get_agent_run_stats: createAgentRunStatsTool(options.userId),
      update_preferences: createUpdatePreferencesTool(options.userId),
    },
  });
