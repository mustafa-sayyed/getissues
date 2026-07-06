type RecommendationDecisionStatus =
  | "notviewed"
  | "viewed"
  | "bookmarked"
  | "deleted";

type RecommendationDecision = {
  userId: string;
  recommendationId: string;
  status: RecommendationDecisionStatus;
  matchScore: number | null;
  reason: string | null;
  issueTitle: string;
  issueDescription: string | null;
  issueUrl: string | null;
  repoName: string | null;
  repoUrl: string | null;
  repoLanguages: string[] | null;
  repoDescription: string | null;
};

const getCogneeApiBaseUrl = () => {
  const baseUrl =
    process.env.COGNEE_BASE_URL ?? process.env.COGNEE_API_URL ?? "";

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

const requestCognee = async (path: string, init: RequestInit) => {
  if (process.env.COGNEE_ENABLED === "false") {
    return null;
  }

  const apiBaseUrl = getCogneeApiBaseUrl();

  if (!apiBaseUrl) {
    console.warn("COGNEE_BASE_URL is not configured; skipping Cognee memory.");
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

  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : null;
};

const datasetNameForUser = (userId: string) =>
  `getissues-user-${userId}-recommendation-decisions`;

const statusMeaning: Record<RecommendationDecisionStatus, string> = {
  notviewed: "The recommendation has not been opened yet.",
  viewed:
    "The user opened this recommendation, which is a weak positive interest signal.",
  bookmarked:
    "The user bookmarked this recommendation, which is a strong positive preference signal.",
  deleted:
    "The user marked this recommendation as not interested, which is a strong negative preference signal.",
};

const buildDecisionMemory = (decision: RecommendationDecision) => {
  const languages =
    decision.repoLanguages && decision.repoLanguages.length > 0
      ? decision.repoLanguages.join(", ")
      : "Unknown";

  return `
User recommendation decision captured by GetIssues.
User ID: ${decision.userId}
Recommendation ID: ${decision.recommendationId}
Decision status: ${decision.status}
Decision meaning: ${statusMeaning[decision.status]}
Original AI match score: ${decision.matchScore ?? "Unknown"}

Issue:
Title: ${decision.issueTitle}
Description: ${decision.issueDescription ?? "No short description available."}
URL: ${decision.issueUrl ?? "No URL available."}

Repository:
Name: ${decision.repoName ?? "Unknown repository"}
URL: ${decision.repoUrl ?? "No repository URL available."}
Languages: ${languages}
Description: ${decision.repoDescription ?? "No repository description available."}

Previous AI reason:
${decision.reason ?? "No prior reason available."}

Use this memory later to personalize issue recommendations. Prefer patterns from bookmarked issues. Avoid patterns from not interested issues.
Captured at: ${new Date().toISOString()}
  `.trim();
};

export const captureRecommendationDecision = async (
  decision: RecommendationDecision,
) => {
  const formData = new FormData();
  const memory = buildDecisionMemory(decision);
  const memoryFile = new Blob([memory], { type: "text/plain" });

  formData.append("data", memoryFile, `${decision.recommendationId}.txt`);
  formData.append("datasetName", datasetNameForUser(decision.userId));
  formData.append(
    "run_in_background",
    process.env.COGNEE_REMEMBER_BACKGROUND ?? "false",
  );

  await requestCognee("/remember", {
    method: "POST",
    body: formData,
  });
};
