import { relations } from "drizzle-orm/relations";
import { user, account, session, repoAnalysis, issue, agentConfig, agentRuns, recommendations, skills } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	agentConfigs: many(agentConfig),
	agentRuns: many(agentRuns),
	recommendations: many(recommendations),
	skills: many(skills),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const issueRelations = relations(issue, ({one, many}) => ({
	repoAnalysis: one(repoAnalysis, {
		fields: [issue.githubRepoId],
		references: [repoAnalysis.githubRepoId]
	}),
	recommendations: many(recommendations),
}));

export const repoAnalysisRelations = relations(repoAnalysis, ({many}) => ({
	issues: many(issue),
}));

export const agentConfigRelations = relations(agentConfig, ({one}) => ({
	user: one(user, {
		fields: [agentConfig.userId],
		references: [user.id]
	}),
}));

export const agentRunsRelations = relations(agentRuns, ({one, many}) => ({
	user: one(user, {
		fields: [agentRuns.userId],
		references: [user.id]
	}),
	recommendations: many(recommendations),
}));

export const recommendationsRelations = relations(recommendations, ({one}) => ({
	user: one(user, {
		fields: [recommendations.userId],
		references: [user.id]
	}),
	issue: one(issue, {
		fields: [recommendations.issueId],
		references: [issue.id]
	}),
	agentRun: one(agentRuns, {
		fields: [recommendations.agentRunId],
		references: [agentRuns.id]
	}),
}));

export const skillsRelations = relations(skills, ({one}) => ({
	user: one(user, {
		fields: [skills.userId],
		references: [user.id]
	}),
}));