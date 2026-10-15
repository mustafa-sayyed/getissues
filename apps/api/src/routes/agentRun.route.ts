import express from "express";
import {
  getAgentRuns,
  getAgentRunStats,
  getAgentRun,
} from "../controllers/agentRun.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";
import { validateParams } from "../middlewares/validate.middleware.ts";
import { runIdParam } from "../validations/recommendation.validation.ts";

const router = express.Router();

router.get("/stats", requireAuth, getAgentRunStats);
router.get("/:runId", requireAuth, validateParams(runIdParam), getAgentRun);
router.get("/", requireAuth, getAgentRuns);

export default router;
