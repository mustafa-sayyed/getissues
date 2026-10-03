import {
  Accessibility,
  Database,
  FileText,
  FlaskConical,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import type { IconType } from "react-icons";
import {
  SiActix,
  SiAngular,
  SiBootstrap,
  SiC,
  SiCplusplus,
  SiCss,
  SiCypress,
  SiDart,
  SiDjango,
  SiDocker,
  SiDrizzle,
  SiElixir,
  SiEslint,
  SiExpress,
  SiFastapi,
  SiFastify,
  SiFlask,
  SiGin,
  SiGit,
  SiGithubactions,
  SiGitlab,
  SiGnubash,
  SiGo,
  SiGraphql,
  SiHaskell,
  SiHelm,
  SiHono,
  SiHtml5,
  SiJavascript,
  SiJenkins,
  SiJest,
  SiJulia,
  SiKoa,
  SiKotlin,
  SiKubernetes,
  SiLaravel,
  SiLua,
  SiMongoose,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiNumpy,
  SiNuxt,
  SiPandas,
  SiPerl,
  SiPhp,
  SiPostgresql,
  SiPrettier,
  SiPrisma,
  SiPython,
  SiPytorch,
  SiR,
  SiReact,
  SiRocket,
  SiRuby,
  SiRubyonrails,
  SiRust,
  SiSass,
  SiScala,
  SiSharp,
  SiSpring,
  SiSpringboot,
  SiSqlite,
  SiSvelte,
  SiSwift,
  SiSymfony,
  SiTailwindcss,
  SiTensorflow,
  SiTerraform,
  SiTokio,
  SiTypeorm,
  SiTypescript,
  SiVite,
  SiVitest,
  SiVuedotjs,
  SiWebpack,
} from "react-icons/si";
import { cn } from "@/lib/utils";

type SkillIconComponent = IconType | LucideIcon;

// Canonical lowercase name -> icon. Rendered in currentColor so contrast
// is controlled by the parent (primary on idle, white on selected).
const SKILL_ICONS: Record<string, SkillIconComponent> = {
  typescript: SiTypescript,
  javascript: SiJavascript,
  python: SiPython,
  rust: SiRust,
  go: SiGo,
  ruby: SiRuby,
  php: SiPhp,
  swift: SiSwift,
  kotlin: SiKotlin,
  dart: SiDart,
  c: SiC,
  "c++": SiCplusplus,
  "c#": SiSharp,
  html: SiHtml5,
  css: SiCss,
  sql: Database,
  shell: SiGnubash,
  bash: SiGnubash,
  scala: SiScala,
  lua: SiLua,
  perl: SiPerl,
  haskell: SiHaskell,
  elixir: SiElixir,
  julia: SiJulia,
  r: SiR,
  react: SiReact,
  nextjs: SiNextdotjs,
  vue: SiVuedotjs,
  nuxt: SiNuxt,
  svelte: SiSvelte,
  sveltekit: SiSvelte,
  angular: SiAngular,
  express: SiExpress,
  fastify: SiFastify,
  koa: SiKoa,
  hono: SiHono,
  nestjs: SiNestjs,
  tailwindcss: SiTailwindcss,
  bootstrap: SiBootstrap,
  sass: SiSass,
  prisma: SiPrisma,
  drizzle: SiDrizzle,
  mongoose: SiMongoose,
  typeorm: SiTypeorm,
  graphql: SiGraphql,
  jest: SiJest,
  vitest: SiVitest,
  cypress: SiCypress,
  django: SiDjango,
  flask: SiFlask,
  fastapi: SiFastapi,
  numpy: SiNumpy,
  pandas: SiPandas,
  tensorflow: SiTensorflow,
  pytorch: SiPytorch,
  gin: SiGin,
  tokio: SiTokio,
  actix: SiActix,
  rocket: SiRocket,
  rails: SiRubyonrails,
  laravel: SiLaravel,
  symfony: SiSymfony,
  spring: SiSpring,
  springboot: SiSpringboot,
  docker: SiDocker,
  githubactions: SiGithubactions,
  jenkins: SiJenkins,
  gitlab: SiGitlab,
  helm: SiHelm,
  terraform: SiTerraform,
  kubernetes: SiKubernetes,
  nginx: SiNginx,
  git: SiGit,
  nodejs: SiNodedotjs,
  mysql: SiMysql,
  sqlite: SiSqlite,
  postgresql: SiPostgresql,
  vite: SiVite,
  webpack: SiWebpack,
  eslint: SiEslint,
  prettier: SiPrettier,
  accessibility: Accessibility,
  performance: Gauge,
  testing: FlaskConical,
  documentation: FileText,
};

// Alternate spellings people type or APIs return.
const SKILL_ICON_ALIASES: Record<string, string> = {
  "tailwind css": "tailwindcss",
  tailwind: "tailwindcss",
  "next.js": "nextjs",
  next: "nextjs",
  "vue.js": "vue",
  "react.js": "react",
  reactjs: "react",
  "express.js": "express",
  "node.js": "nodejs",
  node: "nodejs",
  "c plus plus": "c++",
  "c sharp": "c#",
  "jupyter notebook": "python",
  jupyter: "python",
  "spring boot": "spring",
  "spring framework": "spring",
  "docker compose": "docker",
  "docker-compose": "docker",
  "github actions": "githubactions",
  "gitlab ci": "gitlab",
  postgres: "postgresql",
  sh: "shell",
  zsh: "shell",
  powershell: "shell",
  "actix-web": "actix",
  sveltekit: "svelte",
  rubyonrails: "rails",
};

export function skillIconComponent(name: string) {
  const key = name.trim().toLowerCase();
  if (!key) {
    return null;
  }
  const canonical = SKILL_ICON_ALIASES[key] ?? key.replace(/\s+/g, "");
  return SKILL_ICONS[canonical] ?? SKILL_ICONS[key] ?? null;
}

type SkillIconProps = {
  name: string;
  className?: string;
};

/**
 * Brand icon for a skill, bundled locally (react-icons + lucide — no CDN).
 * Falls back to a letter badge for anything unmapped. Always monochrome
 * via currentColor, so parents control contrast.
 */
export function SkillIcon({ name, className }: SkillIconProps) {
  const Icon = skillIconComponent(name) as
    | React.ComponentType<{ className?: string }>
    | null;

  if (!Icon) {
    return (
      <span
        aria-hidden
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-foreground/10 font-black",
          className ?? "size-4",
          "text-[0.65em]",
        )}
      >
        {name.trim()[0]?.toUpperCase() ?? "?"}
      </span>
    );
  }

  return (
    <span aria-hidden className="contents">
      <Icon className={cn("shrink-0", className ?? "size-4")} />
    </span>
  );
}
