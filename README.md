# Acquisitions API

A production-ready RESTful authentication API built with **Node.js**, **Express 5**, and **PostgreSQL** via [Neon](https://neon.tech). Designed with a clean layered architecture — routes → controllers → services → database — that scales naturally as the application grows.

---

## Features

- **JWT Authentication** — stateless token-based auth with HttpOnly cookies to prevent XSS token theft
- **Secure Password Storage** — bcrypt hashing with configurable salt rounds
- **Request Validation** — Zod schemas enforce shape, types, and constraints before any business logic runs
- **Serverless Postgres** — Neon's serverless driver with Drizzle ORM for type-safe, composable queries
- **Structured Logging** — Winston + Morgan pipeline logs every request and application event
- **Security Hardened** — Helmet sets HTTP security headers, CORS configured per environment
- **Developer Tooling** — ESLint + Prettier enforce consistent code style across the project

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | Neon Serverless PostgreSQL |
| ORM | Drizzle ORM |
| Validation | Zod |
| Auth | JSON Web Tokens (jsonwebtoken) |
| Password Hashing | bcrypt |
| Logging | Winston, Morgan |
| Security | Helmet, CORS |
| Linting/Formatting | ESLint, Prettier |

---

## Architecture

```
src/
├── config/
│   ├── database.js        # Neon + Drizzle connection
│   └── logger.js          # Winston logger setup
├── controllers/
│   └── auth.controller.js # Request handling, response shaping
├── models/
│   └── user.model.js      # Drizzle schema for the users table
├── routes/
│   └── auth.routes.js     # Route definitions
├── services/
│   └── auth.service.js    # Business logic and DB queries
├── utils/
│   ├── cookies.js         # HttpOnly cookie helpers
│   ├── jwt.js             # Token sign/verify wrappers
│   └── format.js          # Zod error formatter
├── validations/
│   └── auth.validation.js # Zod request schemas
├── app.js                 # Express app, middleware stack
└── server.js              # HTTP server bootstrap
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/sign-up` | Register a new user |
| `POST` | `/api/auth/sign-in` | Authenticate and receive a JWT cookie |
| `POST` | `/api/auth/sign-out` | Clear the auth cookie |
| `GET` | `/health` | Health check |

### Sign Up

**`POST /api/auth/sign-up`**

```json
{
  "name": "William Bierwerth",
  "email": "user@example.com",
  "password": "securepassword",
  "role": "user"
}
```

Response `201`:
```json
{
  "message": "User Registered successfully",
  "user": {
    "id": 1,
    "name": "William Bierwerth",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Sign In

**`POST /api/auth/sign-in`**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response `200` + `Set-Cookie: token=<jwt>; HttpOnly`:
```json
{
  "message": "Signed in successfully",
  "user": {
    "id": 1,
    "name": "William Bierwerth",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Sign Out

**`POST /api/auth/sign-out`**

Response `200`:
```json
{
  "message": "Signed out successfully"
}
```

---

## Request Flow

```
Client Request
     │
     ▼
Middleware (helmet → cors → json → cookie-parser → morgan)
     │
     ▼
Router  →  Controller (Zod validation)
                │
                ▼
           Service (business logic)
                │
                ▼
         Drizzle ORM  →  Neon PostgreSQL
                │
                ▼
           Controller (JWT sign + cookie set)
                │
                ▼
        JSON Response
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) database (free tier works)

### Installation

```bash
git clone https://github.com/worthbeer/acquisitions.git
cd acquisitions
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://<user>:<password>@<host>/acquisitions
JWT_SECRET=your-secret-key
```

### Database Setup

```bash
npm run db:generate   # generate migrations from schema
npm run db:migrate    # apply migrations to your database
npm run db:studio     # open Drizzle Studio to browse data
```

### Run

```bash
npm run dev     # development with file watching
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server with `--watch` |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format with Prettier |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |

---

## Docker

The project ships with separate compose files for development and production. Both use the same `Dockerfile` with a multi-stage build — `development` target for local work, `production` target for deployment.

```
Dockerfile                 # multi-stage: development + production targets
docker-compose.dev.yml     # app + Neon Local proxy
docker-compose.prod.yml    # app only, points to Neon cloud
.env.development           # local env vars (copy and fill in)
.env.production            # production env vars (never commit real values)
```

---

### Development (Neon Local)

Neon Local is a Docker proxy that creates an **ephemeral branch** of your Neon cloud database on startup and deletes it on shutdown — so every dev session starts clean without touching your real data.

**1. Fill in `.env.development`**

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgres://neon:npg@neon-local:5432/acquisitions

NEON_API_KEY=your_neon_api_key        # from neon.tech → Account Settings
NEON_PROJECT_ID=your_neon_project_id  # from neon.tech → Project Settings
NEON_PARENT_BRANCH_ID=                # optional: branch to fork from
JWT_SECRET=dev-secret-change-in-production
```

**2. Start the stack**

```bash
docker compose -f docker-compose.dev.yml up --build
```

This starts two containers:
- `neon-local` — proxy on port `5432`, creates an ephemeral branch from `NEON_PARENT_BRANCH_ID`
- `app` — Express API on port `3000`, auto-reloads on file changes via `node --watch`

**3. Run migrations against the local branch**

```bash
# Run inside the app container
docker compose -f docker-compose.dev.yml exec app npm run db:migrate
```

**4. Tear down**

```bash
docker compose -f docker-compose.dev.yml down
```

Neon Local automatically deletes the ephemeral branch on shutdown.

---

### How the dev database connection works

The `@neondatabase/serverless` driver normally sends HTTP queries to Neon's cloud. In development, `src/config/database.js` redirects those requests to the local proxy:

```js
if (process.env.NODE_ENV !== 'production') {
    neonConfig.fetchEndpoint = 'http://neon-local:5432';
    neonConfig.useSecureWebSocket = false;
    neonConfig.poolQueryViaFetch = true;
}
```

`DATABASE_URL` uses the Docker service name `neon-local` as the host — this resolves inside the compose network automatically.

---

### Production (Neon Cloud)

**1. Fill in `.env.production`**

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require
JWT_SECRET=a-long-random-secret-min-32-chars
```

> Never commit `.env.production` with real credentials. Inject secrets via your CI/CD platform (GitHub Actions secrets, Railway, Render, Fly.io env vars, etc.).

**2. Build and start**

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

The production image uses `npm ci --omit=dev` to exclude dev dependencies and runs `node src/index.js` directly — no file watcher overhead.

**3. Run migrations in production**

```bash
docker compose -f docker-compose.prod.yml exec app npm run db:migrate
```

---

### Environment Variable Summary

| Variable | Dev | Prod | Description |
|---|---|---|---|
| `NODE_ENV` | `development` | `production` | Controls neonConfig and logging |
| `PORT` | `3000` | `3000` | HTTP port |
| `DATABASE_URL` | `postgres://neon:npg@neon-local:5432/acquisitions` | Neon cloud URL | DB connection string |
| `NEON_API_KEY` | Required (for Neon Local container) | Not needed | Neon account API key |
| `NEON_PROJECT_ID` | Required (for Neon Local container) | Not needed | Neon project ID |
| `NEON_PARENT_BRANCH_ID` | Optional | Not needed | Branch to fork ephemeral dev branch from |
| `JWT_SECRET` | Any string | Strong random secret | Signs JWT tokens |

---

## License

ISC
