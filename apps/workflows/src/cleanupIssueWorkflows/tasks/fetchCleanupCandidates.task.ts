import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
import { db, schema, sql } from "../../lib/db.js";

export type CleanupIssueCandidate = {
  id: string;
  url: string;
  status: "open" | "closed" | "assigned";
  isAssigned: boolean | null;
  isActive: boolean | null;
};

const DEFAULT_BATCH_SIZE = 100;

/**
 * Fetches issues that should be rechecked against GitHub.
 *
 * Ordering by updatedAt means recently checked rows naturally move to the back
 * because the issue table updates that column on status writes.
 */
export const fetchCleanupCandidatesTask = task(
  { name: "fetchCleanupCandidatesTask", plan: "starter" },
  async (batchSize = DEFAULT_BATCH_SIZE): Promise<CleanupIssueCandidate[]> => {
    const candidates = await db
      .select({
        id: schema.issue.id,
        url: schema.issue.url,
        status: schema.issue.status,
        isAssigned: schema.issue.isAssigned,
        isActive: schema.issue.isActive,
      })
      .from(schema.issue)
      .where(
        sql`${schema.issue.isActive} = true OR ${schema.issue.status} != 'closed'`,
      )
      .orderBy(sql`${schema.issue.updatedAt} ASC NULLS FIRST`)
      .limit(batchSize);

    logger.info(
      { candidateCount: candidates.length, batchSize },
      `Fetched ${candidates.length} issue cleanup candidates.`,
    );

    return candidates;
  },
);
