import { pgEnum } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { repoAnalysis } from "./repoAnalysis.model.js";

// CREATE EXTENSION IF NOT EXISTS vector; 
// add this in SQL migartion file to use the pgvector

export const statusEnum = t.pgEnum("issue_status", ["open", "closed", "assigned"]);

export const issue = pgTable(
  "issue",
  {
    id: t.uuid().primaryKey().defaultRandom(),
    title: t.text().notNull(),
    description: t.text(),
    body: t.text(),
    status: statusEnum("status").default("open").notNull(),
    url: t.text().notNull(),
    githubRepoId: t
      .text("github_repo_id")
      .notNull()
      .references(() => repoAnalysis.githubRepoId),
    embedding: t.vector("embedding", {dimensions: 1536}),
    isActive: t.boolean("is_active").default(true),
    isAssigned: t.boolean("is_assigned").default(false),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: t
      .timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [t.index("issue_id_idx").on(table.id)],
);
