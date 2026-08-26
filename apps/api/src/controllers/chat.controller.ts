import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { and, desc, eq, sql } from "drizzle-orm";
import type { UIMessage } from "ai";
import { toAISdkStream } from "@mastra/ai-sdk";
import { ApiLogger as logger } from "@packages/logging";
import { db, schema } from "../lib/db.ts";
import { asyncHandler } from "../utils/asyncRequest.ts";
import { httpStatusCodes } from "../utils/httpStatusCodes.ts";
import ApiError from "../utils/ApiError.ts";
import { createAssistantAgent } from "../lib/assistantAgent.ts";

const MAX_MESSAGE_LENGTH = 8000;
const MAX_HISTORY_MESSAGES = 40;

const extractMessageText = (message: UIMessage | undefined): string =>
  (message?.parts ?? [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

const buildSystemPrompt = async (userId: string): Promise<string> => {
  const [skills] = await db
    .select({
      languages: schema.skills.languages,
      interests: schema.skills.interests,
    })
    .from(schema.skills)
    .where(eq(schema.skills.userId, userId))
    .limit(1);

  const recentRecommendations = await db
    .select({
      title: schema.issue.title,
      url: schema.issue.url,
      status: schema.recommendations.status,
      matchScore: schema.recommendations.matchScore,
      repoName: schema.repoAnalysis.name,
    })
    .from(schema.recommendations)
    .innerJoin(schema.issue, eq(schema.recommendations.issueId, schema.issue.id))
    .leftJoin(
      schema.repoAnalysis,
      eq(schema.issue.githubRepoId, schema.repoAnalysis.githubRepoId),
    )
    .where(eq(schema.recommendations.userId, userId))
    .orderBy(desc(schema.recommendations.recommendedAt))
    .limit(10);

  const [runStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      successful: sql<number>`count(*) filter (where ${schema.agentRuns.status} = 'success')::int`,
      running: sql<number>`count(*) filter (where ${schema.agentRuns.status} = 'running')::int`,
    })
    .from(schema.agentRuns)
    .where(eq(schema.agentRuns.userId, userId));

  const skillsSection = skills
    ? `Languages: ${skills.languages.join(", ") || "None set"}\nInterests: ${skills.interests || "None set"}`
    : "No skills saved yet.";

  const recommendationsSection = recentRecommendations.length
    ? recentRecommendations
        .map(
          (rec) =>
            `- [${rec.matchScore?.toFixed(2) ?? "?"}] ${rec.title} (${rec.repoName ?? "unknown repo"}) - ${rec.status}`,
        )
        .join("\n")
    : "No recommendations yet.";

  const statsSection = runStats
    ? `${runStats.total} total runs, ${runStats.successful} successful, ${runStats.running} currently running`
    : "No agent runs yet.";

  return `
    You are the GetIssues AI Assistant. You help developers discover open-source GitHub issues that match their skills and interests.

    ## About the user
    ${skillsSection}

    ## Recent recommendations given to the user
    ${recommendationsSection}

    ## Recommendation agent runs
    ${statsSection}

    ## Your capabilities (via tools)
    - get_recommendations: show issues already recommended to the user.
    - search_issues: find open-source issues by semantic similarity to a query.
    - get_agent_run_stats: report how the user's recommendation agent is doing.
    - update_preferences: save the user's programming languages and interests when they share them.

    ## Guidelines
    - Be concise, friendly, and practical.
    - When the user shares preferences (languages, technologies, topics they enjoy), call update_preferences.
    - When listing issues, use markdown links with the issue URL, include the repository name and why it matches.
    - If asked what has been recommended, use get_recommendations instead of guessing.
    - Never invent issue URLs or scores; only use tool results.
    `.trim();
};

const createChatSession = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const title =
    typeof req.body?.title === "string" && req.body.title.trim()
      ? req.body.title.trim().slice(0, 120)
      : "New Chat";

  const [session] = await db
    .insert(schema.chatSessions)
    .values({ userId: req.user.id, title })
    .returning({
      id: schema.chatSessions.id,
      title: schema.chatSessions.title,
      createdAt: schema.chatSessions.createdAt,
    });

  return res.status(httpStatusCodes.CREATED).json({ session });
});

const listChatSessions = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const sessions = await db
    .select({
      id: schema.chatSessions.id,
      title: schema.chatSessions.title,
      createdAt: schema.chatSessions.createdAt,
      updatedAt: schema.chatSessions.updatedAt,
    })
    .from(schema.chatSessions)
    .where(eq(schema.chatSessions.userId, req.user.id))
    .orderBy(desc(schema.chatSessions.updatedAt))
    .limit(50);

  return res.status(httpStatusCodes.OK).json({ sessions });
});

const assertSessionOwnership = async (sessionId: string, userId: string) => {
  const [session] = await db
    .select({ id: schema.chatSessions.id })
    .from(schema.chatSessions)
    .where(
      and(
        eq(schema.chatSessions.id, sessionId),
        eq(schema.chatSessions.userId, userId),
      ),
    )
    .limit(1);

  if (!session) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, "Chat session not found");
  }
};

const getChatSessionMessages = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const sessionId = req.params.sessionId as string;
  await assertSessionOwnership(sessionId, req.user!.id);

  const messages = await db
    .select({
      id: schema.chatMessages.id,
      role: schema.chatMessages.role,
      content: schema.chatMessages.content,
      createdAt: schema.chatMessages.createdAt,
    })
    .from(schema.chatMessages)
    .where(eq(schema.chatMessages.sessionId, sessionId))
    .orderBy(schema.chatMessages.createdAt);

  return res.status(httpStatusCodes.OK).json({ messages });
});

const deleteChatSession = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const sessionId = req.params.sessionId as string;
  await assertSessionOwnership(sessionId, req.user!.id);

  await db.delete(schema.chatSessions).where(eq(schema.chatSessions.id, sessionId));

  return res.status(httpStatusCodes.OK).json({ success: true });
});

const streamChatResponse = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const userId = req.user.id;

  const sessionId = req.body?.sessionId as string | undefined;
  const rawMessages = Array.isArray(req.body?.messages)
    ? (req.body.messages as UIMessage[])
    : [];

  const lastUserMessage = [...rawMessages]
    .reverse()
    .find((message) => message.role === "user");

  if (!lastUserMessage) {
    throw new ApiError(httpStatusCodes.BAD_REQUEST, "No user message provided");
  }

  const userText = extractMessageText(lastUserMessage);
  if (!userText || userText.length > MAX_MESSAGE_LENGTH) {
    throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid message content");
  }

  let activeSessionId = sessionId;
  if (!activeSessionId) {
    const [session] = await db
      .insert(schema.chatSessions)
      .values({
        userId,
        title: userText.slice(0, 80),
      })
      .returning({ id: schema.chatSessions.id });
    activeSessionId = session.id;
  } else {
    await assertSessionOwnership(activeSessionId, userId);
  }

  const history = await db
    .select({
      role: schema.chatMessages.role,
      content: schema.chatMessages.content,
    })
    .from(schema.chatMessages)
    .where(eq(schema.chatMessages.sessionId, activeSessionId))
    .orderBy(schema.chatMessages.createdAt)
    .limit(MAX_HISTORY_MESSAGES);

  await db.insert(schema.chatMessages).values({
    sessionId: activeSessionId,
    userId,
    role: "user",
    content: userText,
  });

  const isFirstExchange = history.length === 0;
  if (isFirstExchange) {
    await db
      .update(schema.chatSessions)
      .set({ title: userText.slice(0, 80) })
      .where(eq(schema.chatSessions.id, activeSessionId));
  }

  const systemPrompt = await buildSystemPrompt(userId);

  const historyMessages = history.map((message) =>
    message.role === "user"
      ? { role: "user" as const, content: message.content }
      : { role: "assistant" as const, content: message.content },
  );

  const agent = createAssistantAgent({ userId, instructions: systemPrompt });

  const messages = [
    ...historyMessages,
    { role: "user" as const, content: userText },
  ];

  let output;
  try {
    output = await agent.stream(messages, { maxSteps: 8 });
  } catch (error) {
    logger.error({ error }, "Failed to start chat stream");
    throw new ApiError(
      httpStatusCodes.INTERNAL_SERVER_ERROR,
      "Chat assistant is unavailable. Please try again later.",
    );
  }

  res.writeHead(httpStatusCodes.OK, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "x-vercel-ai-ui-message-stream": "v1",
  });

  try {
    await pipeline(
      Readable.fromWeb(
        toAISdkStream(output, {
          from: "agent",
          version: "v7",
        }) as import("node:stream/web").ReadableStream,
      ),
      async function* (source) {
        for await (const chunk of source) {
          yield `data: ${JSON.stringify(chunk)}\n\n`;
        }
        yield "data: [DONE]\n\n";
      },
      res,
    );
  } catch (error) {
    logger.error({ error }, "Client disconnected during chat stream");
    return;
  }

  try {
    const assistantText = await output.text;

    if (assistantText.trim()) {
      await db.insert(schema.chatMessages).values({
        sessionId: activeSessionId,
        userId,
        role: "assistant",
        content: assistantText,
      });
    }
  } catch (error) {
    logger.error({ error }, "Failed to persist assistant chat message");
  }
});

export {
  createChatSession,
  listChatSessions,
  getChatSessionMessages,
  deleteChatSession,
  streamChatResponse,
};
