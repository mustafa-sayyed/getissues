import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const repoAnalysis = pgTable("repo_analysis", {
  githubRepoId: t.text("github_repo_id").primaryKey(),
  name: t.text("name").notNull(),
  repoUrl: t.text("repo_url").notNull(),
  languages: t
    .text("languages")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  stars: t.integer("stars").notNull().default(0),
  description: t.text("description"),
  documentationScore: t.integer("documentation_score"),
  contributorFriendliness: t.integer("contributor_friendliness"),
  maintainerResponsiveness: t.integer("maintainer_responsiveness"),
  lastActivityAt: t.timestamp("last_activity_at"),
  isActive: t.boolean("is_active"),
  isLessCrowded: t.boolean("is_less_crowded"),
  lastAnalyzedAt: t.timestamp("last_analyzed_at"),
  createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: t
    .timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [t.index("repo_github_id_idx").on(table.githubRepoId)]);
