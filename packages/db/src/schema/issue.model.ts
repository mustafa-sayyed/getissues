import { pgEnum } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { repoAnalysis } from "./repoAnalysis.model";

// CREATE EXTENSION IF NOT EXISTS vector; 
// add this in SQL migartion file to use the pgvector

const statusEnum = t.pgEnum("status_enum", ["open", "closed", "assigned"]);

export const issue = pgTable(
  "issue",
  {
    id: t.uuid().primaryKey().defaultRandom(),
    title: t.text().notNull(),
    description: t.text(),
    body: t.text(),
    status: statusEnum().default("open").notNull(),
    url: t.text().notNull(),
    repoAnalysisId: t
      .uuid("repo_analysis_id")
      .notNull()
      .references(() => repoAnalysis.id),
    embedding: t.vector("embedding", { dimensions: 1536 }),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: t
      .timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [t.index("issue_id_idx").on(table.id)],
);
