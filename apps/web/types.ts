import { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";
import { Octokit } from "octokit";

const octokit = new Octokit();

type ListIssuesAndPullRequestsResponse = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.rest.search.issuesAndPullRequests
>;
// type IssueOrPullRequestResponse = GetResponseDataTypeFromEndpointMethod<
//   typeof octokit.rest.issues.get
// >;

type UserData = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.rest.users.getAuthenticated
>;

type IssueOrPullRequestResponse = ListIssuesAndPullRequestsResponse["items"][number];

type GithubUserData = UserData & { pullRequests: ListIssuesAndPullRequestsResponse };

export type { ListIssuesAndPullRequestsResponse, UserData, GithubUserData, IssueOrPullRequestResponse };


