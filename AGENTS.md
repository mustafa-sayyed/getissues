# Project Overview

getissues is AI-powered platform where AI Agents search issues on behalf Open Source Contributors, it ingest issues from GitHub and provide personalized recommendations to users based on their skills and interests.


# Project Structure

This codebase is organized as a monorepo using pnpm workspaces and Turborepo. The main directories are:

- `apps/web`: Contains frontend code, Next.js 16 App Router frontend.
- `apps/api`: Contains backend code, Node.js, Express, Postgres.
- `apps/workflows`: Contains workflows for issues ingestion and user recommendations, Core functions and Inngest for Workflows.

Each of this directories has its own `AGENTS.md` file that contains instructions for working on that specific part of the codebase. Please refer to those files for more detailed instructions.
