import { WorkflowLogger as logger } from "@packages/logging";
import { inngest } from "../client.js";
import {
  checkGithubIssueStatusTask,
  fetchCleanupCandidatesTask,
  updateIssueStatusTask,
} from "../../core/issueCleanup/index.js";

const CLEANUP_BATCH_SIZE = 100;

export const cleanupIssueWorkflow = inngest.createFunction(
  {
    id: "cleanup-issues-workflow",
    name: "Issue Cleanup Workflow",
    triggers: [{ cron: "0 12 * * *" }],
  },
  async ({ step }) => {
    const candidates = await step.run("fetch-cleanup-candidates", () =>
      fetchCleanupCandidatesTask(CLEANUP_BATCH_SIZE),
    );

    const stats = {
      checked: 0,
      updated: 0,
      unavailable: 0,
      failed: 0,
    };

    for (const candidate of candidates) {
      try {
        const liveIssue = await step.run(
          `check-github-issue-status-${candidate.id}`,
          () => checkGithubIssueStatusTask(candidate),
        );
        const result = await step.run(
          `update-issue-status-${candidate.id}`,
          () => updateIssueStatusTask(candidate, liveIssue),
        );

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
