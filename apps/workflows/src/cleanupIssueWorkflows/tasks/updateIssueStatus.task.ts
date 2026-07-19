import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
import { db, eq, schema } from "../../lib/db.js";
import type { CleanupIssueCandidate } from "./fetchCleanupCandidates.task.js";
import type { LiveIssueStatus } from "./checkGithubIssueStatus.task.js";

export type IssueCleanupUpdateResult = {
  checked: boolean;
  updated: boolean;
  unavailable: boolean;
};

export const updateIssueStatusTask = task(
  { name: "updateIssueStatusTask", plan: "starter" },
  async (
    currentIssue: CleanupIssueCandidate,
    liveIssue: LiveIssueStatus,
  ): Promise<IssueCleanupUpdateResult> => {
    const hasChanged =
      currentIssue.status !== liveIssue.status ||
      currentIssue.isAssigned !== liveIssue.isAssigned ||
      currentIssue.isActive !== liveIssue.isActive;

    if (!hasChanged) {
      return {
        checked: true,
        updated: false,
        unavailable: liveIssue.unavailable,
      };
    }

    await db
      .update(schema.issue)
      .set({
        status: liveIssue.status,
        isAssigned: liveIssue.isAssigned,
        isActive: liveIssue.isActive,
      })
      .where(eq(schema.issue.id, currentIssue.id));

    logger.info(
      {
        issueId: currentIssue.id,
        previousStatus: currentIssue.status,
        nextStatus: liveIssue.status,
        isAssigned: liveIssue.isAssigned,
        isActive: liveIssue.isActive,
      },
      "Issue cleanup updated stored issue status.",
    );

    return {
      checked: true,
      updated: true,
      unavailable: liveIssue.unavailable,
    };
  },
);
