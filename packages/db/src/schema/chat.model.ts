import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { user } from "./user.model.js";

export const chatMessageRoleEnum = t.pgEnum("chat_message_role", [
  "user",
  "assistant",
  "system",
]);

export const chatSessions = pgTable("chat_sessions", {
  id: t.uuid().primaryKey().defaultRandom(),
  userId: t
    .uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: t.text("title").notNull().default("New Chat"),
  createdAt: t
    .timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: t
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const chatMessages = pgTable("chat_messages", {
  id: t.uuid().primaryKey().defaultRandom(),
  sessionId: t
    .uuid("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  userId: t
    .uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: chatMessageRoleEnum("role").notNull(),
  content: t.text("content").notNull(),
  createdAt: t
    .timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
