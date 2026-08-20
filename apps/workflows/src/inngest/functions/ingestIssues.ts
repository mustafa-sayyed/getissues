import { WorkflowLogger as logger } from "@packages/logging";
import { inngest } from "../client.js";
import { INNGEST_EVENTS } from "../events.js";
import { SEARCH_QUERIES } from "../../lib/githubSearchQueries.js";
import { getOctokit } from "../../lib/octokit.js";
import {
  createIssueEmbeddingTask,
  deduplicateIssueTask,
  discoverReposTask,
  ensureRepoTask,
  fetchRepoIssuesTask,
  storeIssueTask,
} from "../../core/issueIngestion/index.js";
import type {
  GitHubIssueSearchItem,
  GitHubRepoSearchItem,
} from "../../types/github.types.js";

const ISSUE_BATCH_SIZE = 10;
const REPO_ISSUES_PER_REPO = 10;

type ProcessIssueBatchEvent = {
  issues: GitHubIssueSearchItem[];
  source: "label-search" | "repo-discovery";
  batchIndex: number;
};

type ProcessIssueEvent = {
  issue: GitHubIssueSearchItem;
  source: ProcessIssueBatchEvent["source"];
};

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

export const ingestIssuesWorkflow = inngest.createFunction(
  {
    id: "ingest-issues-workflow",
    name: "Issues Ingestion Workflow",
    triggers: [{ cron: "0 */2 * * *" }],
  },
  async ({ step }) => {
    logger.info("Starting issue ingestion workflow.");

    const labelIssues = await step.run(
      "fetch-label-search-issues",
      async () => {
        const octokit = getOctokit();
        const issues: GitHubIssueSearchItem[] = [];

        for (const searchQuery of SEARCH_QUERIES) {
          const searchRes = await octokit.rest.search.issuesAndPullRequests({
            q: searchQuery.query,
            per_page: searchQuery.limit,
          });

          issues.push(...searchRes.data.items);

          logger.info(
            {
              issueCount: searchRes.data.items.length,
              query: searchQuery.query,
            },
            "Fetched label-search issues.",
          );
        }

        return issues;
      },
    );

    const labelBatches = chunk(labelIssues, ISSUE_BATCH_SIZE);

    if (labelBatches.length > 0) {
      await step.sendEvent(
        "dispatch-label-issue-batches",
        labelBatches.map((issues, batchIndex) => ({
          name: INNGEST_EVENTS.processIssueBatch,
          data: {
            issues,
            batchIndex,
            source: "label-search" as const,
          },
        })),
      );
    }

    const repos = await step.run("discover-repos", () => discoverReposTask());
    let repoIssueCount = 0;
    let repoBatchCount = 0;

    for (const repo of repos) {
      const issues = await step.run(`fetch-repo-issues-${repo.id}`, () =>
        fetchRepoIssuesTask(repo as GitHubRepoSearchItem, REPO_ISSUES_PER_REPO),
      );
      const repoBatches = chunk(issues, ISSUE_BATCH_SIZE);
      repoIssueCount += issues.length;
      repoBatchCount += repoBatches.length;

      if (repoBatches.length > 0) {
        await step.sendEvent(
          `dispatch-repo-issue-batches-${repo.id}`,
          repoBatches.map((batchIssues, batchIndex) => ({
            name: INNGEST_EVENTS.processIssueBatch,
            data: {
              issues: batchIssues,
              batchIndex,
              source: "repo-discovery" as const,
            },
          })),
        );
      }
    }

    return {
      success: true,
      labelBasedIssues: labelIssues.length,
      labelBatches: labelBatches.length,
      repoBasedIssues: repoIssueCount,
      repoBatches: repoBatchCount,
      discoveredRepos: repos.length,
    };
  },
);

export const processIssueBatchWorkflow = inngest.createFunction(
  {
    id: "process-issue-batch",
    name: "Process Issue Batch",
    triggers: [{ event: INNGEST_EVENTS.processIssueBatch }],
  },
  async ({ event, step }) => {
    const { issues, source } = event.data as ProcessIssueBatchEvent;

    const dedupeResult = await step.run(
      `deduplicate-${source}-${issues.length}-issues`,
      () => deduplicateIssueTask(issues),
    );

    if (!dedupeResult.issues?.length) {
      return dedupeResult;
    }

    await step.sendEvent(
      "dispatch-unique-issues",
      dedupeResult.issues.map((issue) => ({
        name: INNGEST_EVENTS.processIssue,
        data: {
          issue,
          source,
        },
      })),
    );

    return {
      ...dedupeResult,
      dispatchedIssues: dedupeResult.issues.length,
    };
  },
);

export const processIssueWorkflow = inngest.createFunction(
  {
    id: "process-issue",
    name: "Process Issue",
    triggers: [{ event: INNGEST_EVENTS.processIssue }],
  },
  async ({ event, step }) => {
    const { issue, source } = event.data as ProcessIssueEvent;

    const repoResult = await step.run(`ensure-repo-${issue.id}`, () =>
      ensureRepoTask(issue),
    );

    const embeddingResult = await step.run(`create-embedding-${issue.id}`, () =>
      createIssueEmbeddingTask(
        issue,
        repoResult.githubRepoId,
        repoResult.repoDetails,
      ),
    );


    if (embeddingResult.embedding === null) {
      return {
        ...embeddingResult,
        issueId: issue.id,
        source,
      };
    }

    const storeResult = await step.run(`store-issue-${issue.id}`, () =>
      storeIssueTask(issue, repoResult.githubRepoId, embeddingResult.embedding),
    );

    return {
      success: storeResult.success,
      source,
      issueId: issue.id,
      repo: repoResult.githubRepoId,
      storeResult,
    };
  },
);
