import express from "express";
import {
  createChatSession,
  listChatSessions,
  getChatSessionMessages,
  deleteChatSession,
  streamChatResponse,
} from "../controllers/chat.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.ts";
import {
  chatMessagesQuerySchema,
  createChatSessionSchema,
  sessionIdParam,
  streamChatSchema,
} from "../validations/chat.validation.ts";

const router = express.Router();

router.post(
  "/sessions",
  requireAuth,
  validateBody(createChatSessionSchema),
  createChatSession,
);
router.get("/sessions", requireAuth, listChatSessions);
router.get(
  "/sessions/:sessionId/messages",
  requireAuth,
  validateParams(sessionIdParam),
  validateQuery(chatMessagesQuerySchema),
  getChatSessionMessages,
);
router.delete(
  "/sessions/:sessionId",
  requireAuth,
  validateParams(sessionIdParam),
  deleteChatSession,
);
router.post(
  "/stream",
  requireAuth,
  validateBody(streamChatSchema),
  streamChatResponse,
);

export default router;
