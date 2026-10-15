import express from "express";
import { getIssue, getIssues } from "../controllers/issue.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";
import { validateParams } from "../middlewares/validate.middleware.ts";
import { issueIdParam } from "../validations/recommendation.validation.ts";

const router = express.Router();

router.get("/", requireAuth, getIssues);
router.get("/:id", requireAuth, validateParams(issueIdParam), getIssue);

export default router;
