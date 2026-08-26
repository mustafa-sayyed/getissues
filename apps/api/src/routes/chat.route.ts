import express from "express";
import {
  createChatSession,
  listChatSessions,
  getChatSessionMessages,
  deleteChatSession,
  streamChatResponse,
} from "../controllers/chat.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const router = express.Router();

router.post("/sessions", requireAuth, createChatSession);
router.get("/sessions", requireAuth, listChatSessions);
router.get("/sessions/:sessionId/messages", requireAuth, getChatSessionMessages);
router.delete("/sessions/:sessionId", requireAuth, deleteChatSession);
router.post("/stream", requireAuth, streamChatResponse);

export default router;
