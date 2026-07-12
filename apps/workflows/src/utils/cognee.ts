
const getCogneeApiBaseUrl = () => {
  const baseUrl =
    process.env.COGNEE_BASE_URL ?? "";

  if (!baseUrl) {
    return null;
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  return normalizedBaseUrl.endsWith("/api/v1")
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api/v1`;
};

const getAuthHeaders = () => {
  const headers: Record<string, string> = {};
  const apiKey = process.env.COGNEE_API_KEY;
  const bearerToken =
    process.env.COGNEE_BEARER_TOKEN ?? process.env.COGNEE_AUTH_TOKEN;

  if (apiKey) {
    headers["X-Api-Key"] = apiKey;
  }

  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  return headers;
};

const requestCognee = async (path: string, init: RequestInit): Promise<any> => {
  if (process.env.COGNEE_ENABLED === "false") {
    return null;
  }

  const apiBaseUrl = getCogneeApiBaseUrl();

  if (!apiBaseUrl) {
    console.warn("COGNEE_BASE_URL is not configured; skipping Cognee recall.");
    return null;
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Cognee HTTP ${response.status} ${response.statusText}: ${responseText}`,
    );
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
};

const datasetNameForUser = (userId: string) =>
  `getissues-user-${userId}-recommendation-decisions`;

export const getUserDecisionContext = async (
  userId: string,
  userSkillsText: string,
) => {
  try {
    const response = await requestCognee("/recall", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        searchType: "GRAPH_COMPLETION",
        datasets: [datasetNameForUser(userId)],
        query: `
        Summarize this user's past recommendation decisions for ranking new GitHub issues.
        Focus on bookmarked issues, not interested issues, viewed issues, preferred repositories,
        preferred languages, avoided languages, issue complexity, and contribution style.
        Current user skills: ${userSkillsText}
        `.trim(),
        topK: 8,
        scope: "graph",
        onlyContext: false,
        verbose: false,
        includeReferences: false,
      }),
    });

    return response[0]?.text ?? "";
  } catch (error) {
    console.warn("Unable to recall Cognee recommendation memory.", { error });
    return "";
  }
};
