const LANGUAGE_ALIASES: Record<string, string> = {
  "jupyter notebook": "Python",
  js: "JavaScript",
  ts: "TypeScript",
  "c++": "C++",
  "c#": "C#",
};

// Dependency / topic name (lowercased) -> display skill. GitHub's primary
// `language` field never reports frameworks or tools, so we detect them
// from repo topics and manifest files instead.
const ECOSYSTEM_SKILLS: Record<string, string> = {
  // JavaScript / TypeScript
  react: "React",
  "react-dom": "React",
  next: "Next.js",
  vue: "Vue",
  nuxt: "Nuxt",
  svelte: "Svelte",
  "@sveltejs/kit": "SvelteKit",
  angular: "Angular",
  "@angular/core": "Angular",
  express: "Express",
  fastify: "Fastify",
  koa: "Koa",
  hono: "Hono",
  nestjs: "NestJS",
  "@nestjs/core": "NestJS",
  tailwindcss: "Tailwind CSS",
  tailwind: "Tailwind CSS",
  bootstrap: "Bootstrap",
  sass: "Sass",
  typescript: "TypeScript",
  prisma: "Prisma",
  "@prisma/client": "Prisma",
  "drizzle-orm": "Drizzle",
  drizzle: "Drizzle",
  mongoose: "Mongoose",
  typeorm: "TypeORM",
  graphql: "GraphQL",
  jest: "Jest",
  vitest: "Vitest",
  playwright: "Playwright",
  cypress: "Cypress",
  // Python
  django: "Django",
  flask: "Flask",
  fastapi: "FastAPI",
  numpy: "NumPy",
  pandas: "pandas",
  tensorflow: "TensorFlow",
  torch: "PyTorch",
  pytorch: "PyTorch",
  // Go
  "gin-gonic/gin": "Gin",
  "labstack/echo": "Echo",
  // Rust
  tokio: "Tokio",
  "actix-web": "Actix",
  axum: "Axum",
  rocket: "Rocket",
  // Ruby / PHP / Java
  rails: "Rails",
  laravel: "Laravel",
  symfony: "Symfony",
  "spring-boot": "Spring Boot",
  "spring-framework": "Spring",
};

// Plain-language topics worth counting (everything else — e.g.
// "hacktoberfest", "api", "beginner-friendly" — is noise and ignored).
const TOPIC_LANGUAGES = new Set([
  "typescript",
  "javascript",
  "python",
  "rust",
  "go",
  "java",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "dart",
  "c",
  "c++",
  "c#",
  "scala",
  "elixir",
  "haskell",
  "clojure",
  "erlang",
  "lua",
  "perl",
  "r",
  "julia",
  "shell",
  "bash",
  "sql",
  "html",
  "css",
  "zig",
  "solidity",
]);

// Files whose mere presence proves a skill — checked by existence, not
// content. A repo with a Dockerfile uses Docker, one with
// .github/workflows uses GitHub Actions, etc.
const EXISTENCE_SKILLS: Record<string, string> = {
  Dockerfile: "Docker",
  "docker-compose.yml": "Docker Compose",
  "docker-compose.yaml": "Docker Compose",
  ".github/workflows": "GitHub Actions",
  Jenkinsfile: "Jenkins",
  ".gitlab-ci.yml": "GitLab CI",
  "Chart.yaml": "Helm",
};

const normalizeLanguage = (raw: string): string => {
  const key = raw.trim().toLowerCase();
  return LANGUAGE_ALIASES[key] ?? raw.trim();
};

const toEcosystemSkill = (raw: string): string | null => {
  const cleaned = raw.trim().toLowerCase();
  if (!cleaned) {
    return null;
  }
  // Module paths (go.mod) and scoped packages (@org/name) need looser
  // matching — try the full name, then progressively shorter suffixes.
  const candidates = [cleaned];
  if (cleaned.startsWith("@")) {
    candidates.push(cleaned.split("/")[1] ?? cleaned);
  }
  if (cleaned.includes("/")) {
    const parts = cleaned.split("/");
    candidates.push(parts.slice(-2).join("/"), parts[parts.length - 1] ?? "");
  }
  for (const candidate of candidates) {
    const skill = ECOSYSTEM_SKILLS[candidate];
    if (skill) {
      return skill;
    }
  }
  return null;
};

const parsePackageJson = (text: string): string[] => {
  try {
    const parsed = JSON.parse(text) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return [
      ...Object.keys(parsed.dependencies ?? {}),
      ...Object.keys(parsed.devDependencies ?? {}),
    ];
  } catch {
    return [];
  }
};

const parseRequirementLines = (text: string): string[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("-"))
    .map((line) => {
      const match = /^[A-Za-z0-9_.-]+(\[[A-Za-z0-9_,.-]+\])?/.exec(line);
      return match ? match[0].replace(/\[.*$/, "") : "";
    })
    .filter(Boolean);

const parseGoMod = (text: string): string[] =>
  text
    .split("\n")
    .map((line) => line.trim().split(/\s+/)[0] ?? "")
    .filter((mod) => mod.includes("/"));

const parseCargoToml = (text: string): string[] => {
  const deps: string[] = [];
  let inDependencies = false;
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("[")) {
      inDependencies =
        trimmed === "[dependencies]" ||
        trimmed.startsWith("[dependencies.") ||
        trimmed === "[dev-dependencies]";
      continue;
    }
    if (inDependencies && trimmed && !trimmed.startsWith("#")) {
      const name = trimmed.split("=")[0]?.trim().replace(/['"]/g, "");
      if (name) {
        deps.push(name);
      }
    }
  }
  return deps;
};

const parseGemfile = (text: string): string[] =>
  text
    .split("\n")
    .map((line) => /gem\s+['"]([^'"]+)['"]/.exec(line)?.[1] ?? "")
    .filter(Boolean);

const MANIFEST_PARSERS: Record<string, (text: string) => string[]> = {
  "package.json": parsePackageJson,
  "requirements.txt": parseRequirementLines,
  "pyproject.toml": parseRequirementLines,
  "go.mod": parseGoMod,
  "Cargo.toml": parseCargoToml,
  Gemfile: parseGemfile,
};

const MANIFEST_PATHS = Object.keys(MANIFEST_PARSERS);

const EXISTENCE_PATHS = Object.keys(EXISTENCE_SKILLS);

// Top repos to scan — bounds extra GitHub API calls.
const MAX_MANIFEST_REPOS = 6;

// Ranked cutoff for detected skills.
const MAX_DETECTED_SKILLS = 10;

type SkillCounts = Map<string, number>;

/**
 * Count one vote for a skill, case-insensitively, at most once per repo
 * (guarded by `seen`). Keeps the first-seen display form.
 */
const countSkill = (
  counts: SkillCounts,
  seen: Set<string>,
  name: string,
): void => {
  const key = name.toLowerCase();
  if (seen.has(key)) {
    return;
  }
  seen.add(key);
  const existing =
    [...counts.keys()].find((n) => n.toLowerCase() === key) ?? name;
  counts.set(existing, (counts.get(existing) ?? 0) + 1);
};

const rankSkills = (
  counts: SkillCounts,
  limit: number,
): { name: string; repoCount: number }[] =>
  [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, repoCount]) => ({ name, repoCount }));

export {
  EXISTENCE_PATHS,
  EXISTENCE_SKILLS,
  MANIFEST_PARSERS,
  MANIFEST_PATHS,
  MAX_DETECTED_SKILLS,
  MAX_MANIFEST_REPOS,
  TOPIC_LANGUAGES,
  countSkill,
  normalizeLanguage,
  rankSkills,
  toEcosystemSkill,
};
export type { SkillCounts };
