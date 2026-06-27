import type { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";
import { Octokit } from "octokit";

// Create a temporary Octokit instance solely for type extraction
// (this is a type-only construct, no actual API calls happen here)
declare const octokit: InstanceType<typeof Octokit>;


/**
 * A single item from the GitHub issue/PR search results.
 * Sourced from `octokit.rest.search.issuesAndPullRequests` → `data.items[number]`
 */
export type GitHubIssueSearchData = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.rest.search.issuesAndPullRequests
>;

export type GitHubIssueSearchItem = GitHubIssueSearchData["items"][number];


/**
 * Repository data returned by `octokit.rest.repos.get`.
 */
export type GitHubRepoData = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.rest.repos.get
>;


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
