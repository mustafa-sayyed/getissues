#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status.

echo "Starting development environment..."

docker compose --env-file=.env up -d

echo "Waiting for database to wake up..."

sleep 5 # Pauses for 5 seconds

pnpm --filter=@getissues/api --filter=@getissues/web --parallel dev

