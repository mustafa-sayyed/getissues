# getissues.tech
AI-powered matching between open-source contributors and the GitHub issues they're actually a fit for.

[![Website](https://img.shields.io/badge/site-getissues.tech-blue)](https://getissues.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Finding the right issues on GitHub is often harder than solving it.**

**getissues.tech** is an AI powered platform, where AI Agents search issues on behlaf of user, it helps developers find open-source issues that match their skills, interests, and goals — instead of doom-scrolling repo after repo.



---

## Table of Contents

- [Why](#why)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Why

There are millions of repos and lakhs of issues on Github, but discovery is still broken — people manually search labels like `good-first-issue` across hundreds of repos, with no sense of fit for their actual skill set. getissues.tech closes that gap with semantic matching between a contributor's profile and live GitHub issue data.

## Features

- 🔍 **Semantic issue search** — issues are embedded and matched against contributor skills using `pgvector`, not just keyword/label filters.
- 🤖 **Two-pipeline agent architecture** — one pipeline ingests and embeds issues from GitHub on a schedule, the other serves personalized matches per user.
- ⏱️ **Per-user scheduling** — a lightweight cron heartbeat fans out matching runs only for users who are due, avoiding wasted compute.
- 🔐 **GitHub OAuth** — sign in with GitHub via session-based auth; no separate credentials to manage.
- 🏷️ **Broad issue coverage** — language filters, framework/topic targeting (e.g. React, Next.js, Vue, Django), label variants, and program-specific labels (GSoC, LFX, Hacktoberfest).
- 🧩 **Normalized skills model** — standardized skill naming with shared embeddings, computed once and reused across users.

## Architecture

getissues.tech runs two logically separate pipelines:

1. **Ingestion pipeline** — periodically pulls issues from the GitHub Search API across a set of curated queries (language, topic, label, and star-range filters), deduplicates by `updated_at`, and generates embeddings for new/changed issues.
2. **Matching pipeline** — on a per-user schedule, compares a contributor's skill embeddings against the issue index and generates ranked recommendations.


## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) Postgres database (or any Postgres with `pgvector` enabled)
- A GitHub OAuth App (for auth) and a GitHub personal access token (for issue ingestion)

### Installation

```bash
# clone the repo
git clone https://github.com/<org>/getissues.git
cd getissues

# install dependencies
pnpm install

# copy env template and fill in values
cp .env.example .env

# run database migrations
pnpm run drizzle:migrate

# start the dev server
pnpm run dev
```

The app should now be running at `http://localhost:3000` (frontend) with the API on `http://localhost:8080` (or as configured).

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth App credentials |
| `GITHUB_TOKEN` | Personal access token used for issue ingestion (higher rate limits) |
| `BETTER_AUTH_SECRET` | Session signing secret |

See `.env.example` for the full list.

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

*(Adjust to match your actual monorepo/folder layout.)*

## Roadmap

- [ ] Cross-subdomain auth hardening across desktop and mobile
- [ ] Full 8-tier ingestion query coverage (language, framework/topic, labels, star-range, program-specific)
- [ ] Dynamic per-user scheduling via `agent_schedule`
- [ ] User-facing GitHub actions (e.g. auto-commenting to claim an issue) using stored OAuth tokens

## Contributing

Contributions are welcome! This project is itself meant to be a friendly place to make a first open-source contribution.

1. Fork the repo and create your branch from `main`.
2. Run `pnpm install` and make sure the app runs locally.
3. Make your change, and add tests if applicable.
4. Open a PR with a clear description of what changed and why.

Please check open issues labeled `good-first-issue` or `help-wanted` before starting something new, and feel free to open an issue to discuss larger changes first.

## License

[MIT](./LICENSE)