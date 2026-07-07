# getissues.tech

**Finding the right issues on GitHub is often harder than solving it.**

**getissues.tech** is an AI powered platform, where AI Agents search issues on behlaf of user, it helps developers find open-source issues that match their skills, interests, and goals — instead of doom-scrolling repo after repo.

[![Website](https://img.shields.io/badge/site-getissues.tech-blue)](https://getissues.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/mustafa-sayyed/getissues/actions/workflows/ci.yaml/badge.svg)](https://github.com/mustafa-sayyed/getissues/actions/workflows/ci.yaml)

---

## Table of Contents

- [Why](#why)
- [Features](#features)
- [Contributor Memory](#contributor-memory)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Why

Finding good open source issues to contribute to is genuinely hard. You search GitHub, filter by `good first issue`, open five repos, discover two are abandoned, one has an unfriendly codebase, and the fourth has an issue already claimed. That's 45 minutes gone before you've written a single line of code.

The problem gets worse if you're applying to **GSoC**, **LFX Mentorship**, or participating in **Hacktoberfest** — each program has its own repos, labels, and timelines, and there's no single tool that understands all of them.

**getissues.tech** solves this with an autonomous agent that runs in the background, understands your skills semantically, learns your preferences over time, and delivers relevant, actionable issues directly to your feed.

---

## Features

### Semantic issue matching

The agent doesn't keyword-match your skills against issue labels. It understands meaning. If you know TypeScript and async patterns, it recognizes that a "refactor error propagation in async handlers" issue is relevant to you — even if the word "TypeScript" doesn't appear in the title.

### Autonomous background agent

Set your frequency (every 2h, 4h, 6h) and the agent runs on its own schedule. It fetches issues semantically, scores issues against your profile using an LLM, and delivers the top matches to your app feed, email, or Notion — while you're sleeping, working, or doing anything else.

### Contributor memory powered by Cognee
The agent learns your taste over time — not just your skills. See the [full section](#contributor-memory) below.


### Delivery to where you work
Issues can be delivered to your in-app feed, Notion database. The agent pushes results to you — you don't have to come looking.

---

## Architecture

getissues is built on a two-pipeline architecture — one for system-level issue ingestion and another for per-user recommendation scoring. Both pipelines run on Render Workflows, which allows us to scale horizontally and run each pipeline independently.

### Pipeline 1 — Issue ingestion (system-level)
```
node-cron (runs every few hours)
  └─ Render Workflow: crawl-issues
       ├─ Fetch issues via GitHub API (system PAT, smart search queries)
       ├─ Per-query batch deduplication (in-memory + single batch DB check)
       ├─ Generate embeddings (title + body + labels)
       ├─ fetches and store repo in DB, if not already present
       └─ Store issues in the DB
```

### Pipeline 2 — User recommendation (per-user)
```
node-cron (Every few hours or as per user conf, per user)
       Render Workflow: issue recommendations
         ├─ Fetch user skill profile
         ├─ Query Cognee memory for user preferences and history
         ├─ pgvector similarity search → top 30 candidates
         ├─ batched LLM calls → rerank + explain top results
         ├─ Write to recommendations table
         └─ Deliver (app feed / Notion)
```

---


## Contributor Memory

The most important thing that separates getissues from a GitHub search wrapper is **persistent contributor memory**. Every interaction you have with the platform is a signal. We capture those signals, build a knowledge graph of your preferences, and use that graph to make every subsequent recommendation sharper.

We use **[Cognee](https://github.com/topoteretes/cognee)** — an open-source AI memory and knowledge graph platform — as the memory layer beneath the recommendation agent.

### What we capture

When you interact with a recommendation, we ingest that event into your personal Cognee knowledge graph:

**Dismissals** — when you mark an issue as not interested, we record the issue type, language, complexity, and repo. After a few dismissals of the same pattern, the agent quietly stops surfacing that type without you changing any setting.

**Bookmarks** — when you save an issue, that's a strong positive signal. If you bookmark a Go concurrency issue and Go isn't even in your skill profile, the agent notices the interest and begins stretching recommendations in that direction — matching your _aspiration_, not just your current skills.

**Assignments and contributions** — when you get assigned or merge a PR, that's the strongest signal of all. The agent learns what a confirmed successful match looks like for you and calibrates future scoring accordingly.

---


## Tech stack

| Layer | Technology |
|---|---|
| Feontend | Next.js, TailwindCSS, Shadcn |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| Vector search | pgvector |
| Auth | Better Auth (GitHub OAuth) |
| Background workflows | Render Workflows |
| Scheduling | node-cron |
| AI / agents | Mastra AI |
| Contributor memory | Cognee |
| Infrastructure | Render |

---


## Roadmap

- [x] Semantic issue matching
- [x] Autonomous background agent (Render Workflows)
- [x] Contributor memory with Cognee
- [ ] Dashboard AI Assistant
- [ ] Notion integration 
- [ ] Dynamic per-user scheduling
- [ ] MCP server — Claude, Codex, Gemini, OpenCode integrations
- [ ] Program modes — GSoC, LFX, Hacktoberfest
- [ ] WhatsApp / push notifications

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to this project.

## License

[MIT](./LICENSE)
