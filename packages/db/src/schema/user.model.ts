import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const user = pgTable(
  "user",
  {
    id: t.uuid().primaryKey().defaultRandom(),
    name: t.text().notNull(),
    email: t.varchar({ length: 255 }).unique().notNull(),
    avatarUrl: t.text("avatar_url").notNull(),
    emailVerified: t.boolean("email_verified").notNull(),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: t
      .timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [t.index("email_idx").on(table.email)],
);

export const session = pgTable(
  "session",
  {
    id: t.uuid().primaryKey().defaultRandom(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: t.varchar({ length: 255 }).notNull().unique(),
    ipAddress: t.text("ip_address"),
    userAgent: t.text("user_agent"),
    expiresAt: t.timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: t.timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [t.index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: t.uuid().primaryKey().defaultRandom(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: t.text("account_id").notNull(),
    providerId: t.text("provider_id").notNull(),
    accessToken: t.text("access_token"),
    scope: t.text("scope"),
    createdAt: t.timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [t.index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: t.uuid().primaryKey().defaultRandom(),
    identifier: t.text("identifier").notNull(),
    value: t.text("value").notNull(),
    expiresAt: t.timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: t.timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [t.index("verification_identifier_idx").on(table.identifier)],
);
