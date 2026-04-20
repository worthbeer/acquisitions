# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (Docker — preferred)
docker compose -f docker-compose.dev.yml up --build   # start app + Neon Local proxy
docker compose -f docker-compose.dev.yml down -v      # stop and remove volumes
docker compose -f docker-compose.dev.yml exec app npm run db:migrate

# Development (local, no Docker)
npm run dev           # node --watch src/index.js

# Linting / formatting
npm run lint
npm run lint:fix
npm run format

# Database
npm run db:generate   # generate migrations from schema changes
npm run db:migrate    # apply migrations (uses DATABASE_URL from env)
npm run db:migrate:dev  # migrate against local neon-local proxy
npm run db:studio     # open Drizzle Studio
```

No test runner is configured yet.

## Architecture

Request flow: `Router → Middleware (authenticate) → Controller → Service → Drizzle ORM → Neon PostgreSQL`

**`src/config/database.js`** — dual-driver setup. In production it uses `@neondatabase/serverless` (HTTP driver for Neon cloud). In development it uses the `pg` pool driver pointed at the `neon-local` Docker proxy on port 5432. The exported `db` instance is the same Drizzle API in both environments.

**`src/middleware/auth.middleware.js`** — reads the JWT from the `token` HttpOnly cookie, verifies it via `jwttoken.verify`, and attaches the decoded payload to `req.user`. Routes that require authentication import and apply `authenticate` from here.

**`src/services/`** — all DB queries live here. Services throw named errors (`'User not found'`, `'User already exists'`, `'Invalid credentials'`) that controllers catch and convert to specific HTTP status codes. Never query the DB from a controller.

**`src/validations/`** — Zod schemas only. Controllers call `.safeParse()` and pass errors through `formatValidationError` from `#utils/format.js`. Validation always runs before any service call.

**`#` path aliases** — defined in `package.json` under `"imports"` (e.g. `#services/*`, `#models/*`). Node resolves these natively; no build step needed. `jsconfig.json` maps the same aliases for VS Code IntelliSense.

## Database

Schema is defined in `src/models/*.js` (Drizzle picks up all files via `drizzle.config.js`). Migrations output to `./drizzle/`. After changing any model, run `db:generate` then `db:migrate`.

In development, `DATABASE_URL` must use `neon-local` as the host (Docker service name) — not `localhost` — because the app runs inside the compose network.

## Auth

JWT is signed with `JWT_SECRET` and stored as an HttpOnly cookie (1-day TTL). The cookie helper in `src/utils/cookies.js` sets `secure: true` only in production. Role values are `'user'` (default) and `'admin'`. Only `admin` users can change another user's `role` field — this check lives in `users.controllers.js`, not the service.
