import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
import { fetchCleanupCandidatesTask } from "./tasks/fetchCleanupCandidates.task.js";
import { checkGithubIssueStatusTask } from "./tasks/checkGithubIssueStatus.task.js";
import { updateIssueStatusTask } from "./tasks/updateIssueStatus.task.js";

/**
 * Cleanup Issue Workflow
 *
 * Keeps stored issue availability aligned with GitHub before recommendation
 * runs select candidates from the database.
 */
export const cleanupIssueWorkflow = task(
  { name: "cleanupIssueWorkflow", plan: "starter" },
  async (batchSize?: number) => {
    const candidates = await fetchCleanupCandidatesTask(batchSize);
    const stats = {
      checked: 0,
      updated: 0,
      unavailable: 0,
      failed: 0,
    };

    for (const candidate of candidates) {
      try {
        const liveIssue = await checkGithubIssueStatusTask(candidate);
        const result = await updateIssueStatusTask(candidate, liveIssue);

        if (result.checked) stats.checked += 1;
        if (result.updated) stats.updated += 1;
        if (result.unavailable) stats.unavailable += 1;
      } catch (error) {
        stats.failed += 1;
        logger.error(
          { error, issueId: candidate.id },
          "Issue cleanup candidate failed.",
        );
      }
    }

    logger.info(stats, "Issue cleanup workflow completed.");

    return {
      success: stats.failed === 0,
      ...stats,
    };
  },
);

export { fetchCleanupCandidatesTask } from "./tasks/fetchCleanupCandidates.task.js";
export { checkGithubIssueStatusTask } from "./tasks/checkGithubIssueStatus.task.js";
export { updateIssueStatusTask } from "./tasks/updateIssueStatus.task.js";
