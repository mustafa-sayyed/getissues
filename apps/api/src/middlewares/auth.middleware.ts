import { Request, Response, NextFunction } from "express";
import { auth } from "../utils/auth.js";
import { httpStatusCodes } from "../utils/httpStatusCodes.js";

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
    console.error("Auth middleware error:", error);
    return res
      .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Authentication failed" });
  }
};
