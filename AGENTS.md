# AGENTS.md

Instructions for AI coding agents working in this repo.

## Monorepo layout

pnpm workspaces + Turborepo (`apps/*`, `packages/*`):

- `apps/web` — Next.js 16 App Router frontend. **Read `apps/web/AGENTS.md` before writing web code** (Next.js version has breaking changes vs training data).
- `apps/api` — Express 5 backend. Entrypoints: `src/server.ts` (dev listen + serverless-http export) and `src/app.ts` (routes/middleware). Default port **4000**.
- `apps/workflows` — Mastra agents + **Inngest** functions for issue ingestion and per-user recommendations. Entry: `src/index.ts` (`serve()` from `inngest/lambda`); functions live in `src/inngest/functions/`. Deployed to AWS Lambda via Serverless Framework (`serverless.yml`). See `apps/workflows/README.md`.
- `packages/db` — Drizzle schema **only**. Must not own runtime DB connections; apps create their own clients (`apps/api/src/lib/db.ts` is the pattern).
- `packages/logging` — pino wrapper (`ApiLogger`).

`CONTEXT.md` has been merged into this file. Docs are kept current; if you spot a claim that contradicts the code (e.g. cron jobs inside the API, Render Workflows, `packages/workflows`, port 5000), trust the code and fix the doc.

## Commands

```bash
pnpm dev                      # all apps in parallel (turbo)
pnpm typecheck                # or: pnpm --filter @getissues/api typecheck
pnpm build
pnpm lint                     # API lint == tsc --noEmit; web lint == eslint
```

- Verify a single package with `pnpm --filter <pkg> typecheck` — names are `@getissues/api`, `@getissues/web`, `@getissues/workflows`, `@packages/db`.
- CI (PRs to main): `pnpm typecheck` then `pnpm build`. There are no tests.
- Known pre-existing failure: `@packages/db lint` errors on `drizzle.config.ts` being outside `rootDir`. Don't chase it; use `typecheck` instead.
- Local Postgres (with pgvector): `docker-compose.yaml` runs `pgvector/pgvector:pg17`.

## Database / migrations

- Schema lives in `packages/db/src/schema/*.ts`; after schema changes run:
  ```bash
  pnpm --filter @packages/db drizzle:generate   # writes SQL to packages/db/drizzle
  pnpm --filter @packages/db drizzle:migrate    # needs MIGRATION_DATABASE_URL
  ```
- Embeddings columns are `vector(1536)`. Any change to embedding model/dimensions invalidates stored vectors — keep 1536 dims unless re-embedding everything.

## Code conventions (non-obvious)

- `apps/api`: ESM with relative imports ending in **`.ts`** (e.g. `./lib/db.ts`) — enforced by tsconfig (`allowImportingTsExtensions` + `rewriteRelativeImportExtensions`). `packages/db` uses `.js` specifiers instead.
- Import `db`, `schema`, `eq`, `sql` from the app-local `lib/db.ts` module, never directly from `drizzle-orm`, so Drizzle type identity stays consistent across the package boundary (`packages/db` treats drizzle-orm as peer dep).
- In `apps/api/src/lib/db.ts`, `db` is intentionally cast to a single driver type. Do not revert it to a raw union of `NeonHttpDatabase | NodePgDatabase` — union-typed chains break TS overload resolution (e.g. `.returning({...})` fails with "Expected 0 arguments").

## AI stack

- Chat assistant = Mastra agent (`apps/api/src/lib/assistant-agent.ts`) using **model-router string arrays** for fallbacks (`google/gemini-2.5-flash → groq/openai/gpt-oss-120b → cloudflare-workers-ai/@cf/openai/gpt-oss-120b`) — same pattern as the scoring agent in `apps/workflows/src/lib/agent.ts`. Tools are Mastra `createTool` with zod.
- Streaming bridge: `toAISdkStream(output, { from: "agent", version: "v7" })` from `@mastra/ai-sdk`, hand-framed as SSE (`data: {...}\n\n` … `data: [DONE]\n\n`) into Express `res`. Frontend consumes with **assistant-ui** (`@assistant-ui/react` + `@assistant-ui/ai-sdk` via `useChatRuntime`/`AssistantChatTransport` and `<Thread>` from `components/assistant-ui/thread.tsx`). See `apps/web/components.json` (`@assistant-ui` registry).
- Embeddings use Vercel AI SDK `embedMany` (`@ai-sdk/google`, gemini-embedding, `outputDimensionality: 1536`) — helper in `apps/api/src/lib/ai.ts`.
- Env keys: `GOOGLE_API_KEY` (embeddings + google models), `GROQ_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_API_TOKEN` (model router fallbacks). Cognee memory is gated by `COGNEE_ENABLED`/`COGNEE_BASE_URL`.

## Frontend ↔ backend wiring

- Web calls the API with absolute URLs from `NEXT_PUBLIC_API_URL`, cookies via `withCredentials` (shared axios instance: `apps/web/lib/api.ts`). Better Auth cookie prefix: `getissues`.
- Auth guard: `apps/api/src/middlewares/auth.middleware.ts` (`requireAuth` sets `req.user`); controllers must null-check `req.user` and throw `ApiError`.

## Key directories

- Web: `app/(root)` (landing/login), `app/(dashboard)/dashboard/*` (authenticated pages), `components/ui` (shadcn primitives), `components/dashboard` (shell/sidebar), `lib/auth-client.ts`, `lib/store.ts` + `lib/features/*` (Redux).
- API: `src/routes` + `src/controllers` (one pair per resource, registered in `app.ts` under `/api/v1/*`), `src/utils/auth.ts` (Better Auth + GitHub OAuth), `src/lib` (app-owned clients: db, ai, assistant agent), `src/validations` (zod) via `validate.middleware`.
- Schema files in `packages/db/src/schema`: `user.model.ts` (Better Auth user/session/account/verification), `issue.model.ts`, `repoAnalysis.model.ts`, `skills.model.ts`, `recommendation.model.ts`, `agentRuns.model.ts`, `agentConfig.model.ts`, `agentIssueEvaluation.model.ts`, `chat.model.ts`.

## Environment variables

Per-app `.env` / `.env.local` files (no committed templates). Main ones: `DATABASE_URL`, `MIGRATION_DATABASE_URL` (db package only), `BETTER_AUTH_URL`, `CORS_ORIGIN`, `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` (auth) and `GITHUB_ACCESS_TOKEN` (workflows ingestion), plus the AI keys listed above.
