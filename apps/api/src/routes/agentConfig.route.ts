import express from "express";
import { getAgentConfig } from "../controllers/agentConfig.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const router = express.Router();

router.get("/", requireAuth, getAgentConfig);

export default router;
