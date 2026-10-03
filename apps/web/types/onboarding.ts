type DetectedLanguage = {
  name: string;
  repoCount: number;
};

type TopRepo = {
  name: string;
  stars: number;
  language: string | null;
};

type OnboardingProfile = {
  login: string;
  name: string | null;
  avatarUrl: string;
  publicRepos: number;
  totalPRs: number;
  detectedLanguages: DetectedLanguage[];
  topRepos: TopRepo[];
};

type PreviewIssue = {
  id: string;
  title: string;
  url: string;
  similarity?: number | null;
  repo: {
    name: string | null;
    languages: string[] | null;
    stars: number | null;
  } | null;
};

type Vibe = {
  journey: string;
  flavors: string[];
  note: string;
};

export type {
  DetectedLanguage,
  OnboardingProfile,
  PreviewIssue,
  TopRepo,
  Vibe,
};
