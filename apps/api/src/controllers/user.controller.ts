import { asyncHandler } from "../utils/asyncRequest.js";
import { auth } from "../utils/auth.js";
import { httpStatusCodes } from "../utils/httpStatusCodes.js";
import { getOctokit } from "../utils/octokit.js";
import { db, schema, eq, sql } from "../lib/db.js";
import { fromNodeHeaders } from "better-auth/node";
import { ApiLogger as logger } from "@packages/logging";
import { ai } from "../lib/google.js";
import ApiError from "../utils/ApiError.js";

const buildSkillsEmbedding = async (languages: string[], interests: string) => {
  try {
    const result = await ai.models.embedContent({
      contents: [languages.join(", ") + "\n\n" + interests],
      model: "gemini-embedding-2",
      config: {
        outputDimensionality: 1536,
      },
    });

    return result.embeddings?.[0]?.values ?? null;
  } catch (error) {
    logger.error({ error }, "Error building skills embedding:");
    return null;
  }
};

const getGithubUserData = asyncHandler(async (req, res) => {
  const userId = req.params.userId as string;

  const { accessToken } = await auth.api.getAccessToken({
    body: {
      providerId: "github",
      userId: userId,
    },
  });

  const octokit = getOctokit(accessToken ?? process.env.GITHUB_ACCESS_TOKEN!);

  const data = await octokit.rest.users.getAuthenticated();
  const pulls = await octokit.rest.search.issuesAndPullRequests({
    q: `author:${data.data.login}`,
  });

  res
    .status(httpStatusCodes.OK)
    .json({ ...data.data, pullRequests: pulls.data });
});

const getUserSkills = asyncHandler(async (req, res) => {
  const { includeEmbedding = null } = req.query as { includeEmbedding: string };

  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const userSkills = await db
    .select({
      languages: schema.skills.languages,
      interests: schema.skills.interests,
      embedding: includeEmbedding ? schema.skills.embedding : sql`NULL`,
    })
    .from(schema.skills)
    .where(eq(schema.skills.userId, req.user.id))
    .limit(1);

  if (!userSkills.length) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ error: "Skills not found" });
  }

  return res.status(httpStatusCodes.OK).json(userSkills[0]);
});

const createUserSkills = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const { languages, interests } = req.body;

  const existingSkills = await db
    .select({ userId: schema.skills.userId })
    .from(schema.skills)
    .where(eq(schema.skills.userId, req.user.id))
    .limit(1);

  if (existingSkills.length > 0) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json({ error: "Skills already exist. Use the update endpoint." });
  }

  const embedding = await buildSkillsEmbedding(languages, interests);

  if (!embedding) {
    throw new ApiError(
      httpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create User Skills",
    );
  }

  await db.insert(schema.skills).values({
    userId: req.user.id,
    languages,
    interests,
    embedding,
  });

  return res
    .status(httpStatusCodes.CREATED)
    .json({ success: true, message: "User skills saved successfully" });
});

const updateUserSkills = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const { languages, interests } = req.body;

  const existingSkills = await db
    .select({ userId: schema.skills.userId })
    .from(schema.skills)
    .where(eq(schema.skills.userId, req.user.id))
    .limit(1);

  if (!existingSkills.length) {
    throw new ApiError(
      httpStatusCodes.NOT_FOUND,
      "Skills not found. Use the create endpoint to add skills first.",
    );
  }

  const embedding = await buildSkillsEmbedding(languages, interests);

  if (!embedding) {
    throw new ApiError(
      httpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to update User Skills",
    );
  }

  await db
    .update(schema.skills)
    .set({
      languages,
      interests,
      embedding,
    })
    .where(eq(schema.skills.userId, req.user.id));

  return res.status(httpStatusCodes.OK).json({ success: true, updated: true });
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const result = await auth.api.signOut({
    headers: fromNodeHeaders(req.headers),
  });

  if (!result.success) {
    throw new ApiError(
      httpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to log out user",
    );
  }

  return res.status(httpStatusCodes.OK).json({ success: true });
});

const deleteAccount = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  await auth.api.deleteUser({
    body: {},
    headers: fromNodeHeaders(req.headers),
  });

  const result = await auth.api.signOut({
    headers: fromNodeHeaders(req.headers),
    returnHeaders: true,
  });

  for (const cookie of result.headers.getSetCookie()) {
    res.append("Set-Cookie", cookie);
  }

  return res.status(httpStatusCodes.OK).json({ success: true });
});

export {
  getGithubUserData,
  getUserSkills,
  createUserSkills,
  updateUserSkills,
  logoutUser,
  deleteAccount,
};
