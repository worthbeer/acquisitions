#!/bin/sh
docker compose --env-file .env.development -f docker-compose.dev.yml up --build
