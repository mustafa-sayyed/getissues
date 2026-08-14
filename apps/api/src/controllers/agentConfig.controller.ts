import { eq } from "drizzle-orm";
import { db, schema } from "../lib/db.ts";
import { asyncHandler } from "../utils/asyncRequest.ts";
import { httpStatusCodes } from "../utils/httpStatusCodes.ts";
import ApiError from "../utils/ApiError.ts";

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
