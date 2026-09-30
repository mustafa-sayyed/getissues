# Overview

This directory contains the backend code for the getissues platform, built using Node.js and Express.

- Uses Postgres as the database, with Drizzle as the ORM.
- it is deployed to AWS Lambda via Serverless Framework (`serverless.yml`).
- Runs dev server for development, use Docker for local Postgres.

# Conventions

Conventions for writing backend code:

- Avoid using `any` type, prefer explicit types and interfaces.
- use [asyncHandler](src/utils/asyncRequest.ts) inside express controller to async code and catch errors, instead of try/catch blocks.
