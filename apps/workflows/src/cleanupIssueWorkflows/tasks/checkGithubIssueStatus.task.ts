import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
import { getOctokit } from "../../lib/octokit.js";
import type { CleanupIssueCandidate } from "./fetchCleanupCandidates.task.js";

export type LiveIssueStatus = {
  id: string;
  status: "open" | "closed" | "assigned";
  isAssigned: boolean;
  isActive: boolean;
  unavailable: boolean;
};

const parseIssueUrl = (url: string) => {
  const match = url.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)\/?$/,
  );

  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2],
    issueNumber: Number(match[3]),
  };
};

export const checkGithubIssueStatusTask = task(
  { name: "checkGithubIssueStatusTask", plan: "starter" },
  async (issue: CleanupIssueCandidate): Promise<LiveIssueStatus> => {
    const parsed = parseIssueUrl(issue.url);

    if (!parsed) {
      logger.warn(
        { issueId: issue.id, issueUrl: issue.url },
        "Unable to parse issue URL during cleanup.",
      );

      return {
        id: issue.id,
        status: "closed",
        isAssigned: true,
        isActive: false,
        unavailable: true,
      };
    }

    try {
      const octokit = getOctokit();
      const { data } = await octokit.rest.issues.get({
        owner: parsed.owner,
        repo: parsed.repo,
        issue_number: parsed.issueNumber,
      });

      const isAssigned = (data.assignees?.length ?? 0) > 0;
      const isClosed = data.state === "closed";
      const isActive = !isClosed && !isAssigned && !data.locked;
      const status = isClosed ? "closed" : isAssigned ? "assigned" : "open";

      return {
        id: issue.id,
        status,
        isAssigned,
        isActive,
        unavailable: false,
      };
    } catch (error) {
      const status = (error as { status?: number }).status;

      if (status === 404 || status === 410) {
        return {
          id: issue.id,
          status: "closed",
          isAssigned: true,
          isActive: false,
          unavailable: true,
        };
      }

      logger.error(
        { error, issueId: issue.id, issueUrl: issue.url },
        "Failed to fetch live GitHub issue status.",
      );

      throw error;
    }
  },
);
