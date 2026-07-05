import { asyncHandler } from "../utils/asyncRequest.js";
import { auth } from "../utils/auth.js";
import { httpStatusCodes } from "../utils/httpStatusCodes.js";
import { getOctokit } from "../utils/octokit.js";
import { db, schema, eq, sql } from "../lib/db.js";
import { getVoyageClient } from "../lib/voyage.js";
import { fromNodeHeaders } from "better-auth/node";

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
  if (!req.user) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized" });
  }

  const userSkills = await db
    .select({
      languages: schema.skills.languages,
      interests: schema.skills.interests,
      embedding: schema.skills.embedding,
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

const saveUserSkills = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized" });
  }

  const { languages, interests } = req.body;

  const voyage = getVoyageClient();
  const embeddingResponse = await voyage.embed({
    input: `${languages.join(", ")} \n\n ${interests}`,
    model: "voyage-3",
  });

  const embedding = embeddingResponse.data?.[0]?.embedding;

  if (!embedding) {
    return res
      .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to Save User Skills" });
  }

  const existingSkills = await db
    .select()
    .from(schema.skills)
    .where(eq(schema.skills.userId, req.user.id))
    .limit(1);

  if (existingSkills.length > 0) {
    await db
      .update(schema.skills)
      .set({
        languages,
        interests,
        embedding,
      })
      .where(eq(schema.skills.userId, req.user.id));

    return res
      .status(httpStatusCodes.OK)
      .json({ success: true, updated: true });
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

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized" });
  }

  const result = await auth.api.signOut({
    headers: fromNodeHeaders(req.headers),
  });

  if (!result.success) {
    return res
      .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to log out" });
  }

  return res.status(httpStatusCodes.OK).json({ success: true });
});

const deleteAccount = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized" });
  }

  await auth.api.signOut({
    headers: fromNodeHeaders(req.headers),
  });

  await db.delete(schema.user).where(eq(schema.user.id, req.user.id));

  return res.status(httpStatusCodes.OK).json({ success: true });
});

export {
  getGithubUserData,
  getUserSkills,
  saveUserSkills,
  logoutUser,
  deleteAccount,
};
