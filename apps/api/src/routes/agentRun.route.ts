import express from "express";
import {
  getAgentRuns,
  getAgentRunStats,
} from "../controllers/agentRun.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/stats", requireAuth, getAgentRunStats);
router.get("/", requireAuth, getAgentRuns);

export default router;
