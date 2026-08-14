import type { Request, Response, NextFunction } from "express";
import { ApiLogger as logger } from "@packages/logging";
import { auth } from "../utils/auth.ts";
import { httpStatusCodes } from "../utils/httpStatusCodes.ts";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return res
        .status(httpStatusCodes.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    req.session = session.session;
    req.user = session.user;

    next();
  } catch (error) {
    logger.error({ error }, "Auth middleware error:");
    return res
      .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Authentication failed" });
  }
};
