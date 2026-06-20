import { Octokit } from "octokit";

export function getOctokit(accessToken: string): Octokit {
  return new Octokit({
    auth: accessToken,
  });
}
