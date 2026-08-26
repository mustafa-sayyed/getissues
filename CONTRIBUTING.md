# Getting Started

getissues codebase is structured as a monorepo using pnpm workspaces and tuborepo with the following structure:

## Project Structure

```
.
├── apps/
│   ├── web/          # frontend (getissues.tech)
│   ├── api/          # backend (api.getissues.tech)
│   └── workflows/    # Inngest functions + Mastra agents (issue ingest & recommendations)
├── packages/
│   ├── db/           # Drizzle schema + migrations
│   └── logging/      # pino logger wrapper
```

### Prerequisites

- Node.js 22+
- A Postgres database (with `pgvector` enabled)
- A GitHub App/OAuth App for issue ingestion and user auth (see [GitHub docs](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) for setup)

### Installation

```bash
# clone the repo
git clone https://github.com/mustafa-sayyed/getissues.git
cd getissues

# install dependencies
pnpm install

# build packages
pnpm build

# create env files for each app that needs one and fill in values.
# There are no committed templates - see AGENTS.md for the required variables.
# Typical locations:
#   apps/api/.env            DATABASE_URL, BETTER_AUTH_URL, CORS_ORIGIN,
#                            GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET, GOOGLE_API_KEY ...
#   apps/web/.env.local       NEXT_PUBLIC_API_URL, NEXT_PUBLIC_BETTER_AUTH_API_URL ...
#   apps/workflows/.env       DATABASE_URL, GITHUB_ACCESS_TOKEN, AI provider keys ...
#   packages/db/.env          MIGRATION_DATABASE_URL

# run database migrations
cd packages/db
pnpm run drizzle:generate # generates SQL migration files from Drizzle schema
pnpm run drizzle:migrate # runs migrations against the database

# start the dev server (frontend + backend + workflows)
pnpm run dev # run from the root directory
```

The app should now be running at `http://localhost:3000` (frontend) with the API on `http://localhost:4000` (or as configured via `PORT`).



