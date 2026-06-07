import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

const users = pgTable("users", {
  id: t.uuid().primaryKey().defaultRandom(),
  name: t.text().notNull(),
  email: t.varchar({ length: 255 }).unique().notNull(),
  avatarUrl: t.text("avatar_url").notNull(),
  emailVerified: t.boolean("email_verified").notNull().default(true),
  createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: t.timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const session = pgTable("session", {
  id: t.uuid().primaryKey().defaultRandom(),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: t.varchar({ length: 255 }).notNull().unique(),
  ipAddress: t.text("ip_address"),
  userAgent: t.text("user_agent"),
  expiresAt: t.timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: t.timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: t.timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const account = pgTable("account", {
  id: t.uuid().primaryKey().defaultRandom(),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: t.text("account_id").notNull(),
  providerId: t.text("provider_id").notNull(),
  accessToken: t.text("access_token"),
  createdAt: t
    .timestamp("created_at", { precision: 6, withTimezone: true })
    .notNull(),
  updatedAt: t
    .timestamp("updated_at", { precision: 6, withTimezone: true })
    .notNull(),
});