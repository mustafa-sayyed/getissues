import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
import { getOctokit } from "../../lib/octokit.js";
import type {
  GitHubIssueSearchItem,
  GitHubRepoSearchItem,
} from "../../types/github.types.js";

const DEFAULT_ISSUES_PER_REPO = 10;
const issueSorts = ["updated", "created"] as const;

const randomItem = <T>(items: readonly T[]) =>
  items[Math.floor(Math.random() * items.length)];

export const fetchRepoIssuesTask = task(
  { name: "fetchRepoIssuesTask", plan: "starter" },
  async (
    repo: GitHubRepoSearchItem,
    issuesPerRepo = DEFAULT_ISSUES_PER_REPO,
  ): Promise<GitHubIssueSearchItem[]> => {
    const octokit = getOctokit();
    const query = `repo:${repo.full_name} is:issue is:open no:assignee`;

    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q: query,
      sort: randomItem(issueSorts),
      order: "desc",
      per_page: issuesPerRepo,
    });

    const issues = data.items.filter(
      (issue) => !issue.pull_request && !issue.locked,
    );

    logger.info(
      {
        repo: repo.full_name,
        fetchedIssues: data.items.length,
        selectedIssues: issues.length,
      },
      `Fetched ${issues.length} repo-discovered issues from ${repo.full_name}.`,
    );

    return issues;
  },
);
