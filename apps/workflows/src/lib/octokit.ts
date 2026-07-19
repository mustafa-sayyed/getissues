import { Octokit } from "octokit";

/**
 * Octokit clients keyed by token. When GITHUB_ACCESS_TOKEN contains multiple
 * comma-separated tokens, each call picks one at random.
 */
const octokitClients = new Map<string, Octokit>();

const parseGithubTokens = (value?: string) =>
  value
    ?.split(",")
    .map((token) => token.trim())
    .filter(Boolean) ?? [];

const getRandomGithubToken = () => {
  const tokens = parseGithubTokens(process.env.GITHUB_ACCESS_TOKEN);

  if (!tokens.length) {
    throw new Error("GITHUB_ACCESS_TOKEN environment variable is not set.");
  }

  return tokens[Math.floor(Math.random() * tokens.length)];
};

export function getOctokit(): Octokit {
  const token = getRandomGithubToken();
  const existingClient = octokitClients.get(token);

  if (existingClient) {
    return existingClient;
  }

  const client = new Octokit({ auth: token });
  octokitClients.set(token, client);
  return client;
}
