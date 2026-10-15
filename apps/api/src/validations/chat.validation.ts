import { z } from "zod";

const uuidParam = z.object({
  sessionId: z.uuid("Invalid session id"),
});

const sessionIdParam = uuidParam;

const chatMessageSchema = z.object({
  id: z.string().min(1).optional(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z
    .array(
      z.object({
        type: z.string().min(1),
        text: z.string().max(8000).optional(),
      }),
    )
    .min(1, "Message must contain at least one part"),
});

export const streamChatSchema = z.object({
  sessionId: z.uuid("Invalid session id").optional(),
  messages: z.array(chatMessageSchema).min(1, "No messages provided"),
});

export const createChatSessionSchema = z.object({
  title: z.string().trim().max(120).optional(),
});

export const chatMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  cursor: z.uuid("Invalid cursor").optional(),
});

export { uuidParam, sessionIdParam };
