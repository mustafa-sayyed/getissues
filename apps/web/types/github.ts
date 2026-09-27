// GitHub response types now live in `@packages/shared`.
// This module is a thin shim so existing `@/types/github` imports keep working.
export type {
  GithubUserData,
  GitHubIssueSearchData,
  GitHubIssueSearchItem,
  IssueOrPullRequestResponse,
  ListIssuesAndPullRequestsResponse,
  UserData,
} from "@packages/shared";
