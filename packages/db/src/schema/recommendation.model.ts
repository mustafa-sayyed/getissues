import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { user } from "./user.model.js";
import { issue } from "./issue.model.js";
import { agentRuns } from "./agentRuns.model.js";

export const recommendationStatusEnum = t.pgEnum("recommendation_status", [
  "viewed",
  "deleted",
  "bookmarked",
  "notviewed",
]);

export const recommendations = pgTable("recommendations", {
  id: t.uuid().primaryKey().defaultRandom(),
  userId: t
    .uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  issueId: t
    .uuid("issue_id")
    .notNull()
    .references(() => issue.id, { onDelete: "cascade" }),
  agentRunId: t
    .uuid("agent_run_id")
    .notNull()
    .references(() => agentRuns.id),
  reason: t.text("reason"),
  matchScore: t.real("match_score"),
  status: recommendationStatusEnum("status").default("notviewed").notNull(),
  recommendedAt: t
    .timestamp("recommended_at", { withTimezone: true })
    .defaultNow(),
});
