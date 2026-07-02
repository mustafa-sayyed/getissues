import { eq } from "drizzle-orm";
import { db, schema } from "../lib/db.js";
import { asyncHandler } from "../utils/asyncRequest.js";
import { httpStatusCodes } from "../utils/httpStatusCodes.js";

const getAgentConfig = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json({ error: "Unauthorized" });
  }

  const configs = await db
    .select()
    .from(schema.agentConfig)
    .where(eq(schema.agentConfig.userId, req.user.id));

  return res.status(httpStatusCodes.OK).json({ configs });
});

export { getAgentConfig };
