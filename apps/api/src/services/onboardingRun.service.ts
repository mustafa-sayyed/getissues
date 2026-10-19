import {
  and,
  eq,
  getTableColumns,
  gte,
  isNotNull,
  notInArray,
  sql,
} from "drizzle-orm";
import { ApiLogger as logger } from "@packages/shared";
import { embedText, toPgVector } from "@packages/shared";
import { db, schema } from "../lib/db.ts";
import {
  scoreIssues,
  type IssueEvaluation,
  type ScorableIssue,
} from "../lib/scoringAgent.ts";

// How many vector candidates we pull before LLM scoring. Retrieval is cheap
// (one pgvector query); scoring is the expensive part, so we over-retrieve
// then keep only the best.
const RETRIEVE_LIMIT = 30;
// Issues per LLM scoring call. Each batch emits one progress event and a
// per-issue verdict; 30 candidates → 6 sequential calls.
const SCORE_BATCH_SIZE = 5;
// Acceptance bar, kept identical to the scheduled pipeline
// (apps/workflows/src/core/userRecommendation/storeRecommendation.ts) so
// onboarding and background runs agree on what counts as a match.
const SCORE_THRESHOLD = 0.5;
// Maximum number of matches delivered. Fewer is allowed when the score bar
// rejects the rest; results are never padded with low-scoring issues.
const DELIVER_COUNT = 5;
// "Not stale": ignore issues untouched for longer than this.
const FRESHNESS_DAYS = 60;
// Cadence of the scheduler cron in apps/workflows ("0 */4 * * *"); keep in
// sync. The live onboarding run bypasses the scheduler, so it publishes
// nextRunAt itself to drive the dashboard "Next Agent Run" countdown.
const SCHEDULER_CRON_HOURS = 4;

type CandidateIssue = {
  issue: typeof schema.issue.$inferSelect;
  repo: typeof schema.repoAnalysis.$inferSelect | null;
};

export type OnboardingRecommendation = {
  id: string;
  title: string;
  url: string;
  similarity: number;
  repo: {
    name: string | null;
    languages: string[] | null;
    stars: number | null;
  } | null;
};

export type BatchVerdict = {
  issueId: string;
  title: string;
  score: number;
  reason: string;
  accepted: boolean;
};

export type OnboardingStreamEvent =
  | {
      type: "stage";
      stage: "saving" | "searching" | "scoring" | "storing";
      message: string;
      batch?: number;
      totalBatches?: number;
    }
  | {
      type: "batch";
      batch: number;
      totalBatches: number;
      candidateCount: number;
      verdicts: BatchVerdict[];
    }
  | {
      type: "done";
      runId: string;
      recommendations: OnboardingRecommendation[];
    };

const startAgentRun = async (userId: string): Promise<string> => {
  const [run] = await db
    .insert(schema.agentRuns)
    .values({ userId, status: "running" })
    .returning({ id: schema.agentRuns.id });

  if (!run) {
    throw new Error("Failed to start agent run");
  }

  return run.id;
};

const completeAgentRun = async (
  agentRunId: string,
  status: "success" | "failed",
): Promise<void> => {
  await db
    .update(schema.agentRuns)
    .set({ status, endedAt: new Date() })
    .where(eq(schema.agentRuns.id, agentRunId));
};

// Next multiple of SCHEDULER_CRON_HOURS (in UTC) strictly after `from` — the
// scheduler's next tick. Landing exactly on a boundary returns the following
// one; past 20:00 UTC it rolls to 00:00 the next day.
const nextSchedulerRunAt = (from: Date): Date => {
  const next = new Date(from);
  next.setUTCMinutes(0, 0, 0);
  const nextHour =
    (Math.floor(from.getUTCHours() / SCHEDULER_CRON_HOURS) + 1) *
    SCHEDULER_CRON_HOURS;

  if (nextHour >= 24) {
    next.setUTCDate(next.getUTCDate() + 1);
    next.setUTCHours(0);
  } else {
    next.setUTCHours(nextHour);
  }

  return next;
};

const scheduleNextRun = async (userId: string): Promise<void> => {
  const now = new Date();
  const nextRunAt = nextSchedulerRunAt(now);

  try {
    await db
      .insert(schema.agentConfig)
      .values({ userId, configType: "general", lastRunAt: now, nextRunAt })
      .onConflictDoUpdate({
        target: [schema.agentConfig.userId, schema.agentConfig.configType],
        set: { lastRunAt: now, nextRunAt },
      });
  } catch (error) {
    // Scheduling only affects the dashboard countdown; swallowing the error
    // keeps an already-successful run from being marked failed.
    logger.error(
      { error, userId },
      "Failed to publish onboarding agent schedule.",
    );
  }
};

const toScorable = (candidate: CandidateIssue): ScorableIssue => ({
  id: candidate.issue.id,
  title: candidate.issue.title,
  body: candidate.issue.body,
});

const retrieveCandidates = async (
  embeddingVector: string,
  userId: string,
): Promise<CandidateIssue[]> => {
  const [recommended, evaluated] = await Promise.all([
    db
      .select({ issueId: schema.recommendations.issueId })
      .from(schema.recommendations)
      .where(eq(schema.recommendations.userId, userId)),
    db
      .select({ issueId: schema.agentIssueEvaluation.issueId })
      .from(schema.agentIssueEvaluation)
      .where(eq(schema.agentIssueEvaluation.userId, userId)),
  ]);

  const freshnessCutoff = new Date(
    Date.now() - FRESHNESS_DAYS * 24 * 60 * 60 * 1000,
  );

  return db
    .select({
      issue: getTableColumns(schema.issue),
      repo: getTableColumns(schema.repoAnalysis),
    })
    .from(schema.issue)
    .leftJoin(
      schema.repoAnalysis,
      eq(schema.issue.githubRepoId, schema.repoAnalysis.githubRepoId),
    )
    .where(
      and(
        eq(schema.issue.status, "open"),
        eq(schema.issue.isAssigned, false),
        eq(schema.issue.isActive, true),
        isNotNull(schema.issue.embedding),
        gte(schema.issue.updatedAt, freshnessCutoff),
        notInArray(
          schema.issue.id,
          recommended.map((r) => r.issueId),
        ),
        notInArray(
          schema.issue.id,
          evaluated.map((e) => e.issueId),
        ),
      ),
    )
    .orderBy(sql`${schema.issue.embedding} <=> ${embeddingVector}::vector`)
    .limit(RETRIEVE_LIMIT);
};

/**
 * Full synchronous onboarding run: save skills → retrieve candidates →
 * strict batch scoring → store top matches as real recommendations linked
 * to a real agent run. Yields SSE-ready events as it goes; the caller
 * streams them and the generator throws on failure (after marking the
 * agent run failed) so the caller can emit an error event.
 */
export async function* runOnboardingPipeline(
  userId: string,
  languages: string[],
  interests: string,
): AsyncGenerator<OnboardingStreamEvent, void, void> {
  const skillsText = `${languages.join(", ")}\n\n${interests}`;
  let agentRunId: string | undefined;

  try {
    yield {
      type: "stage",
      stage: "saving",
      message: "Saving your choices…",
    };

    const embedding = await embedText(skillsText);
    if (!embedding?.length) {
      throw new Error("Failed to build skills embedding");
    }

    await db
      .insert(schema.skills)
      .values({ userId, languages, interests, embedding })
      .onConflictDoUpdate({
        target: schema.skills.userId,
        set: { languages, interests, embedding },
      });

    yield {
      type: "stage",
      stage: "searching",
      message: "Looking at open work…",
    };

    const candidates = await retrieveCandidates(toPgVector(embedding), userId);

    logger.info(
      { userId, candidates: candidates.length },
      "Onboarding run retrieved candidates.",
    );

    agentRunId = await startAgentRun(userId);

    if (candidates.length === 0) {
      await completeAgentRun(agentRunId, "success");
      await scheduleNextRun(userId);
      yield { type: "done", runId: agentRunId, recommendations: [] };
      return;
    }

    const totalBatches = Math.ceil(candidates.length / SCORE_BATCH_SIZE);
    const evaluations: IssueEvaluation[] = [];

    for (let i = 0; i < candidates.length; i += SCORE_BATCH_SIZE) {
      const batchNumber = Math.floor(i / SCORE_BATCH_SIZE) + 1;
      yield {
        type: "stage",
        stage: "scoring",
        message: `Scoring batch ${batchNumber} of ${totalBatches}…`,
        batch: batchNumber,
        totalBatches,
      };

      const batch = candidates.slice(i, i + SCORE_BATCH_SIZE);
      const batchEvaluations = await scoreIssues(
        batch.map(toScorable),
        skillsText,
      );
      evaluations.push(...batchEvaluations);

      const batchTitles = new Map(
        batch.map((c) => [c.issue.id, c.issue.title]),
      );
      yield {
        type: "batch",
        batch: batchNumber,
        totalBatches,
        candidateCount: candidates.length,
        verdicts: batchEvaluations.map((e) => ({
          issueId: e.issueId,
          title: batchTitles.get(e.issueId) ?? "Unknown issue",
          score: e.score,
          reason: e.reason,
          accepted: e.score >= SCORE_THRESHOLD,
        })),
      };
    }

    yield {
      type: "stage",
      stage: "storing",
      message: "Picking your top matches…",
    };

    const winners = evaluations
      .filter((e) => e.score >= SCORE_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, DELIVER_COUNT);
    const winnerIds = new Set(winners.map((w) => w.issueId));
    // Below-threshold issues go to evaluation history so the scheduled
    // pipeline never re-scores them. Above-threshold overflow is deliberately
    // left unstored so the next scheduled run can still deliver it.
    const losers = evaluations.filter(
      (e) => e.score < SCORE_THRESHOLD && !winnerIds.has(e.issueId),
    );

    if (winners.length > 0) {
      await db.insert(schema.recommendations).values(
        winners.map((w) => ({
          userId,
          issueId: w.issueId,
          agentRunId: agentRunId as string,
          matchScore: w.score,
          reason: w.reason,
        })),
      );
    }

    if (losers.length > 0) {
      await db.insert(schema.agentIssueEvaluation).values(
        losers.map((e) => ({
          agentId: agentRunId as string,
          issueId: e.issueId,
          userId,
          matchScore: e.score,
          reason: e.reason,
        })),
      );
    }

    await completeAgentRun(agentRunId, "success");
    await scheduleNextRun(userId);

    const candidatesById = new Map(candidates.map((c) => [c.issue.id, c]));
    const recommendations: OnboardingRecommendation[] = [];
    for (const winner of winners) {
      const candidate = candidatesById.get(winner.issueId);
      if (!candidate) continue;
      recommendations.push({
        id: candidate.issue.id,
        title: candidate.issue.title,
        url: candidate.issue.url,
        similarity: winner.score,
        repo: candidate.repo
          ? {
              name: candidate.repo.name,
              languages: candidate.repo.languages,
              stars: candidate.repo.stars,
            }
          : null,
      });
    }

    logger.info(
      { userId, agentRunId, delivered: recommendations.length },
      "Onboarding run completed.",
    );

    yield { type: "done", runId: agentRunId, recommendations };
  } catch (error) {
    logger.error({ error, userId }, "Onboarding run failed.");

    if (agentRunId) {
      try {
        await completeAgentRun(agentRunId, "failed");
      } catch (completeError) {
        logger.error(
          { error: completeError, agentRunId },
          "Failed to mark onboarding agent run as failed.",
        );
      }
    }

    throw error;
  }
}
