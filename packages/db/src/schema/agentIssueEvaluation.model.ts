import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { issue } from "./issue.model.js";
import { agentRuns } from "./agentRuns.model.js";
import { user } from "./user.model.js";

export const agentIssueEvaluation = pgTable("agent_issue_evaluation", {
  id: t.uuid().primaryKey().defaultRandom(),
  issueId: t
    .uuid("issue_id")
    .notNull()
    .references(() => issue.id),
  agentId: t
    .uuid("agent_id")
    .notNull()
    .references(() => agentRuns.id),
  userId: t
    .uuid("user_id")
    .notNull()
    .references(() => user.id),
  reason: t.text("reason"),
  matchScore: t.integer("match_score").notNull(),
  createdAt: t
    .timestamp("created_at", { withTimezone: true })
    .defaultNow(),
  updatedAt: t
    .timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});
