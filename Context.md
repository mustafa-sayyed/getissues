# GetIssues Codebase Context

## What This Project Is

GetIssues is a pnpm/turbo monorepo for recommending GitHub issues to users based on their skills and preferences. The product has three main parts:

- A Next.js web dashboard for the user-facing app.
- An Express API for auth, user routes, cron scheduling, and backend integration.
- Shared packages for database schema and background workflows.

## Monorepo Layout

- `apps/web`: Next.js frontend. Uses the App Router, dashboard routes, shadcn-style UI components, Tailwind CSS, Redux store utilities, and Better Auth client integration.
- `apps/api`: Express backend. Handles Better Auth, API routes, cron jobs, workflow triggering, and shared backend utilities.
- `packages/db`: Shared Drizzle schema package. This package should define and export schema, not own application database connections.
- `packages/workflows`: Background workflow/task package for ingesting GitHub issues and generating user recommendations.

Workspace config lives in:

- `pnpm-workspace.yaml`
- `turbo.json`
- root `package.json`

## Frontend Notes

The main frontend app is under `apps/web`.

Important areas:

- `apps/web/app/(root)`: public/root pages such as landing and login.
- `apps/web/app/(dashboard)`: authenticated dashboard area.
- `apps/web/app/(dashboard)/dashboard/page.tsx`: dashboard home page.
- `apps/web/app/(dashboard)/dashboard/issues/page.tsx`: dashboard issues page.
- `apps/web/app/(dashboard)/dashboard/profile/page.tsx`: profile page.
- `apps/web/app/(dashboard)/dashboard/settings/page.tsx`: settings page.
- `apps/web/components/ui`: reusable UI primitives.
- `apps/web/components/dashboard`: dashboard layout/navigation components.
- `apps/web/lib/auth-client.ts`: frontend auth client.
- `apps/web/lib/store.ts`, `StoreProvider.tsx`, `hooks.ts`, `features/*`: Redux state setup.

Design appears dashboard/product-oriented. Keep UI dense, scannable, and consistent with existing shadcn/Tailwind patterns.

## API Notes

The backend app is under `apps/api`.

Important areas:

- `apps/api/src/index.ts`: Express server entrypoint, auth handler registration, routes, health endpoint, and cron scheduling.
- `apps/api/src/utils/auth.ts`: Better Auth server config.
- `apps/api/src/routes`: Express route definitions.
- `apps/api/src/controllers`: request handlers.
- `apps/api/src/utils`: shared backend utilities such as auth, Octokit, async request wrapper, and status codes.
- `apps/api/src/lib`: app-owned runtime integrations such as database/client helpers.

The API uses Better Auth with a Drizzle adapter and GitHub OAuth.

## Database Architecture

Database schema is Drizzle/Postgres and lives in `packages/db/src/schema`.

Known schema areas include:

- `user.model.ts`: Better Auth user/session/account/verification tables plus user fields.
- `issue.model.ts`: GitHub issues and embeddings.
- `repoAnalysis.model.ts`: repository metadata/analysis.
- `skills.model.ts`: user skill data and embeddings.
- `recommendation.model.ts`: issue recommendations.
- `agentRuns.model.ts`: workflow/agent run status.
- `agentConfig.model.ts`: agent configuration.

Important architectural rule:

- `packages/db` should export schema only.
- Runtime apps should create their own Drizzle client.
- Apps that connect to Postgres should own `drizzle-orm`, `drizzle-orm/node-postgres`, and `pg` dependencies.
- `packages/db` should treat `drizzle-orm` as a peer dependency and dev dependency.

This avoids duplicate Drizzle type identities across package boundaries.

Recommended app-local pattern:

```ts
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "@packages/db";

export { eq, schema, sql };

export const db = drizzle(process.env.DATABASE_URL!, {
  casing: "snake_case",
  schema,
});
```

Then app code should import `db`, `schema`, `eq`, and `sql` from the local db module instead of mixing imports from different package contexts.

## Workflows Package

The workflow package is under `packages/workflows`.

Important areas:

- `src/index.ts`: workflow package barrel exports.
- `src/lib`: shared workflow runtime clients/helpers.
- `src/issueIngestionWorkflows`: GitHub issue ingestion pipeline.
- `src/userRecommendationWorkflows`: user recommendation pipeline.
- `src/types/github.types.ts`: GitHub API types.

Issue ingestion flow:

- fetch issues from GitHub
- deduplicate existing issues
- ensure repository metadata exists
- create issue embedding
- store issue

User recommendation flow:

- start an agent run
- read user skills/preferences
- embed preferences
- search issues by pgvector similarity
- score candidates with an LLM/agent
- store recommendations above threshold
- complete/fail the agent run

External services used by workflows include Octokit/GitHub, VoyageAI embeddings, and AI SDK/Mastra-style LLM helpers.

## Package Scripts

Useful commands:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm --filter @getissues/api typecheck
pnpm --filter @packages/db typecheck
pnpm --filter @getissues/workflows typecheck
```

Package managers/tools:

- pnpm workspaces
- Turbo
- TypeScript
- Next.js
- Express
- Drizzle ORM
- Better Auth

## Environment And Services

Postgres is configured through Docker Compose in `docker-compose.yaml`.

Relevant environment variables likely include:

- `DATABASE_URL`: runtime Postgres connection string.
- `MIGRATION_DATABASE_URL`: migration connection string for Drizzle Kit.
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`: Better Auth GitHub OAuth.
- `GITHUB_TOKEN`: GitHub API access for workflows.
- `CORS_ORIGIN`: frontend origin for API CORS/trusted auth origins.
- provider keys for VoyageAI and configured LLM providers.

## Development Cautions

- The repo may have a dirty working tree. Do not revert unrelated changes unless explicitly asked.
- Keep `@packages/db` free of app-owned runtime connections.
- Avoid importing Drizzle helpers directly in many places if a package-local `lib/db.ts` re-exports them; use the local module to preserve type identity.
- With NodeNext/ESM packages, relative TypeScript imports should generally use `.js` specifiers.
- Database migrations live under `packages/db/drizzle` and Drizzle config is in `packages/db/drizzle.config.ts`.
