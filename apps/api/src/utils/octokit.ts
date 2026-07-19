import { Octokit } from "octokit";

const parseGithubTokens = (value?: string) =>
  value
    ?.split(",")
    .map((token) => token.trim())
    .filter(Boolean) ?? [];

const getRandomGithubToken = (value?: string) => {
  const tokens = parseGithubTokens(value);

  if (!tokens.length) {
    throw new Error("GitHub access token is not configured.");
  }

  return tokens[Math.floor(Math.random() * tokens.length)];
};

export function getOctokit(accessToken: string): Octokit {
  return new Octokit({
    auth: getRandomGithubToken(accessToken),
  });
}
