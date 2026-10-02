type DetectedSkill = {
  name: string;
  repoCount: number;
};

type TopRepoSummary = {
  name: string;
  stars: number;
  language: string | null;
};

type OnboardingProfilePayload = {
  login: string;
  name: string | null;
  avatarUrl: string;
  publicRepos: number;
  totalPRs: number;
  detectedLanguages: DetectedSkill[];
  topRepos: TopRepoSummary[];
};

export type { DetectedSkill, OnboardingProfilePayload, TopRepoSummary };
