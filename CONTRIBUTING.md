# Getting Started

getissues codebase is structured as a monorepo using pnpm workspaces and tuborepo with the following structure:

## Project Structure

```
.
├── apps/
│   ├── web/          # frontend (getissues.tech)
│   └── api/           # backend (api.getissues.tech)
├── packages/
│   ├── db/            # Drizzle schema + migrations
│   └── workflows/         # issue ingest and reccommendation workflows
```

### Prerequisites

- Node.js 22+
- A Postgres database (with `pgvector` enabled)
- A GitHub App/OAuth App for issue ingestion and user auth (see [GitHub docs](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) for setup)
- getissues uses [Render Workflows](https://render.com/workflows) for issue ingestion and recommendation.
To setup render workflows, see [Docs](https://render.com/docs/workflows-local-development) for more information.

### Installation

```bash
# clone the repo
git clone https://github.com/mustafa-sayyed/getissues.git
cd getissues

# install dependencies
pnpm install

# biuld packages
pnpm build

# copy env template and fill in values
cd aaps/api
cp .env.example .env

cd aaps/web
cp .env.example .env

cd packages/workflows
cp .env.example .env

cd packages/db
cp .env.example .env

# run database migrations
cd packages/db
pnpm run drizzle:generate # generates SQL migration files from Drizzle schema
pnpm run drizzle:migrate # runs migrations against the database


# start the dev server (frontend + backend)
pnpm run dev # run from the root directory

```

The app should now be running at `http://localhost:3000` (frontend) with the API on `http://localhost:5000` (or as configured).



