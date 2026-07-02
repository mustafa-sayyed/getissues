import express from "express";
import { getAgentConfig } from "../controllers/agentConfig.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getAgentConfig);

export default router;
