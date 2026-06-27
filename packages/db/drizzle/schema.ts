import { pgTable, index, uuid, text, timestamp, foreignKey, unique, varchar, boolean, integer, vector, real, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const agentConfigStatus = pgEnum("agent_config_status", ['idle', 'running', 'paused'])
export const agentConfigType = pgEnum("agent_config_type", ['general', 'hacktoberfest', 'gssoc', 'gsoc', 'LFX'])
export const agentRunStatus = pgEnum("agent_run_status", ['failed', 'success', 'running'])
export const issueStatus = pgEnum("issue_status", ['open', 'closed', 'assigned'])
export const recommendationStatus = pgEnum("recommendation_status", ['viewed', 'deleted', 'bookmarked', 'notviewed'])


export const verification = pgTable("verification", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const account = pgTable("account", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	accessToken: text("access_token"),
	scope: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: varchar({ length: 255 }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const user = pgTable("user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: varchar({ length: 255 }).notNull(),
	avatarUrl: text("avatar_url").notNull(),
	emailVerified: boolean("email_verified").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	githubId: text("github_id"),
	lastActiveAt: timestamp("last_active_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("user_email_unique").on(table.email),
]);

export const repoAnalysis = pgTable("repo_analysis", {
	name: text().notNull(),
	repoUrl: text("repo_url").notNull(),
	languages: text().array().default(["RAY"]).notNull(),
	stars: integer().default(0).notNull(),
	description: text(),
	maintainerResponsiveness: integer("maintainer_responsiveness"),
	lastActivityAt: timestamp("last_activity_at", { mode: 'string' }),
	isActive: boolean("is_active"),
	isLessCrowded: boolean("is_less_crowded"),
	lastAnalyzedAt: timestamp("last_analyzed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	githubRepoId: text("github_repo_id").primaryKey().notNull(),
	documentationScore: integer("documentation_score"),
	contributorFriendliness: integer("contributor_friendliness"),
}, (table) => [
	index("repo_github_id_idx").using("btree", table.githubRepoId.asc().nullsLast().op("text_ops")),
]);

export const issue = pgTable("issue", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	body: text(),
	status: issueStatus().default('open').notNull(),
	url: text().notNull(),
	githubRepoId: text("github_repo_id").notNull(),
	embedding: vector({ dimensions: 1536 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	isActive: boolean("is_active").default(true),
	isAssigned: boolean("is_assigned").default(false),
}, (table) => [
	index("issue_id_idx").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.githubRepoId],
			foreignColumns: [repoAnalysis.githubRepoId],
			name: "issue_github_repo_id_repo_analysis_github_repo_id_fk"
		}),
]);

export const agentConfig = pgTable("agent_config", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	configType: agentConfigType("config_type").notNull(),
	cronSchedule: text("cron_schedule").default('general').notNull(),
	lastRunAt: timestamp("last_run_at", { withTimezone: true, mode: 'string' }),
	nextRunAt: timestamp("next_run_at", { withTimezone: true, mode: 'string' }),
	status: agentConfigStatus().default('idle').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "agent_config_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const agentRuns = pgTable("agent_runs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	status: agentRunStatus().notNull(),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	endedAt: timestamp("ended_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "agent_runs_user_id_user_id_fk"
		}),
]);

export const recommendations = pgTable("recommendations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	issueId: uuid("issue_id").notNull(),
	agentRunId: uuid("agent_run_id").notNull(),
	reason: text(),
	matchScore: real("match_score"),
	status: recommendationStatus().default('notviewed').notNull(),
	recommendedAt: timestamp("recommended_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "recommendations_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.issueId],
			foreignColumns: [issue.id],
			name: "recommendations_issue_id_issue_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.agentRunId],
			foreignColumns: [agentRuns.id],
			name: "recommendations_agent_run_id_agent_runs_id_fk"
		}),
]);

export const skills = pgTable("skills", {
	userId: uuid().primaryKey().notNull(),
	name: text().array().notNull(),
	details: text().notNull(),
	embedding: vector({ dimensions: 1536 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "skills_userId_user_id_fk"
		}),
]);
