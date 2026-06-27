import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { user } from "./user.model.js";

export const agentConfigTypeEnum = t.pgEnum("agent_config_type", ["general", "hacktoberfest", "gssoc", "gsoc", "LFX"]);
export const agentConfigStatusEnum = t.pgEnum("agent_config_status", ["idle", "running", "paused"]);

export const agentConfig = pgTable("agent_config", {
  id: t.uuid().primaryKey().defaultRandom(),
  userId: t.uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  configType: agentConfigTypeEnum("config_type").notNull(),
  cronSchedule: t.text("cron_schedule").default("general").notNull(),
  lastRunAt: t.timestamp("last_run_at", { withTimezone: true }),
  nextRunAt: t.timestamp("next_run_at", { withTimezone: true }),
  status: agentConfigStatusEnum("status").default("idle").notNull(),
});
