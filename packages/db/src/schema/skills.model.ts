import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { user } from "./user.model.js";
import { sql } from "drizzle-orm";

export const skills = pgTable("skills", {
  userId: t
    .uuid("user_id")
    .primaryKey()
    .notNull()
    .references(() => user.id),
  languages: t.text("languages").array().notNull(),
  interests: t.text("interests").notNull(),
  embedding: t.vector("embedding", { dimensions: 1536 }).notNull(),
});
