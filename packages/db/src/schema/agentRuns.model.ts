import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { user } from "./user.model.js";

export const agentRunStatusEnum = t.pgEnum("agent_run_status", [
  "failed",
  "success",
  "running",
]);

export const agentRuns = pgTable("agent_runs", {
  id: t.uuid().primaryKey().defaultRandom(),
  userId: t
    .uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: agentRunStatusEnum("status").notNull(),
  startedAt: t.timestamp("started_at", { withTimezone: true }).defaultNow(),
  endedAt: t.timestamp("ended_at", { withTimezone: true }),
});
