import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
import { getOctokit } from "../../lib/octokit.js";
import type { GitHubRepoSearchItem } from "../../types/github.types.js";

const DEFAULT_REPO_LIMIT = 5;
const REPO_SEARCH_PER_PAGE = 30;
const MAX_RANDOM_PAGE = 10;

const languages = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "Ruby",
  "PHP",
  "Kotlin",
  "Swift",
];

const topics = [
  "developer-tools",
  "cli",
  "web",
  "react",
  "nextjs",
  "api",
  "database",
  "testing",
  "accessibility",
  "documentation",
];

const starRanges = [
  "50..100",
  "100..300",
  "300..1000",
  "1000..5000",
  "5000..10000",
];

const randomItem = <T>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

const shuffle = <T>(items: T[]) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const buildRepositoryQuery = () => {
  const pushedSince = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const starRange = randomItem(starRanges);
  const useTopic = Math.random() > 0.5;
  const discoveryFilter = useTopic
    ? `topic:${randomItem(topics)}`
    : `language:${randomItem(languages)}`;

  return `${discoveryFilter} stars:${starRange} pushed:>${pushedSince} archived:false fork:false`;
};

export const discoverReposTask = task(
  { name: "discoverReposTask", plan: "starter" },
  async (repoLimit = DEFAULT_REPO_LIMIT): Promise<GitHubRepoSearchItem[]> => {
    const octokit = getOctokit();
    const query = buildRepositoryQuery();
    const page = Math.floor(Math.random() * MAX_RANDOM_PAGE) + 1;

    const { data } = await octokit.rest.search.repos({
      q: query,
      sort: "updated",
      order: "desc",
      per_page: REPO_SEARCH_PER_PAGE,
      page,
    });

    const repos = shuffle(data.items)
      .filter(
        (repo) => !repo.archived && !repo.fork && repo.stargazers_count >= 50,
      )
      .slice(0, repoLimit);

    logger.info(
      {
        query,
        page,
        foundRepos: data.items.length,
        selectedRepos: repos.length,
      },
      `Discovered ${repos.length} repositories for issue ingestion.`,
    );

    return repos;
  },
);
