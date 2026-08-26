import express from "express";
import {
  getAgentRuns,
  getAgentRunStats,
  getAgentRun,
} from "../controllers/agentRun.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const router = express.Router();

router.get("/stats", requireAuth, getAgentRunStats);
router.get("/:runId", requireAuth, getAgentRun);
router.get("/", requireAuth, getAgentRuns);

export default router;
