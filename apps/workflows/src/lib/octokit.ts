import { Octokit } from "octokit";

/**
 * Singleton Octokit client shared across all workflow tasks.
 */
let _octokit: Octokit | null = null;

export function getOctokit(): Octokit {
  if (!_octokit) {
    if (!process.env.GITHUB_ACCESS_TOKEN) {
      throw new Error("GITHUB_ACCESS_TOKEN environment variable is not set.");
    }
    _octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
  }
  return _octokit;
}
