import type { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";
import type { Octokit } from "octokit";

// Type-only Octokit instance used solely for extracting endpoint response
// types (no API calls, no runtime cost).
declare const octokit: InstanceType<typeof Octokit>;

/**
 * A single page of GitHub issue/PR search results.
 * Sourced from `octokit.rest.search.issuesAndPullRequests` → `data`.
 */
export type GitHubIssueSearchData = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.rest.search.issuesAndPullRequests
>;

/**
 * A single item from the GitHub issue/PR search results
 * (`data.items[number]`).
 */
export type GitHubIssueSearchItem = GitHubIssueSearchData["items"][number];

/**
 * Repository search data returned by `octokit.rest.search.repos`.
 */
export type GitHubRepoSearchData = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.rest.search.repos
>;

export type GitHubRepoSearchItem = GitHubRepoSearchData["items"][number];

/**
 * Repository data returned by `octokit.rest.repos.get`.
 */
export type GitHubRepoData = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.rest.repos.get
>;

/**
 * Authenticated GitHub user returned by `octokit.rest.users.getAuthenticated`.
 */
export type GitHubAuthenticatedUser = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.rest.users.getAuthenticated
>;

/**
 * Authenticated user plus their authored issues/PRs (used by the web dashboard).
 */
export type GitHubUserWithPullRequests = GitHubAuthenticatedUser & {
  pullRequests: GitHubIssueSearchData;
};

/**
 * Parsed owner/repo identifier extracted from a GitHub repository URL.
 */
export interface RepoIdentifier {
  owner: string;
  repo: string;
  githubRepoId: string;
}

export interface RepoDetails {
  name: string;
  description: string | null;
  stars: number;
  languages: string[];
}

// ---------------------------------------------------------------------------
// Backwards-compatible aliases for the names previously defined in
// `apps/web/types/github.ts`.
// ---------------------------------------------------------------------------

/** @deprecated Use `GitHubIssueSearchData` instead. */
export type ListIssuesAndPullRequestsResponse = GitHubIssueSearchData;

/** @deprecated Use `GitHubIssueSearchItem` instead. */
export type IssueOrPullRequestResponse = GitHubIssueSearchItem;

/** @deprecated Use `GitHubAuthenticatedUser` instead. */
export type UserData = GitHubAuthenticatedUser;

/** @deprecated Use `GitHubUserWithPullRequests` instead. */
export type GithubUserData = GitHubUserWithPullRequests;
