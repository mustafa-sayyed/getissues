import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { user } from "./user.model.js";

export const skills = pgTable("skills", {
  userId: t
    .uuid()
    .primaryKey()
    .notNull()
    .references(() => user.id),
  skills: t.text("name").array().notNull().default([]),
  skillDetails: t.text("details").notNull().default(""),
  embedding: t.vector("embedding", { dimensions: 1536 }).notNull().default([]),
});
