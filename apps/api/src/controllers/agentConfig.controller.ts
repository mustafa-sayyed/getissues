import { eq } from "drizzle-orm";
import { db, schema } from "../lib/db.js";
import { asyncHandler } from "../utils/asyncRequest.js";
import { httpStatusCodes } from "../utils/httpStatusCodes.js";
import ApiError from "../utils/ApiError.js";

const getAgentConfig = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const configs = await db
    .select()
    .from(schema.agentConfig)
    .where(eq(schema.agentConfig.userId, req.user.id));

  return res.status(httpStatusCodes.OK).json({ configs });
});

export { getAgentConfig };
