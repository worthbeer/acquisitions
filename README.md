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

## License

ISC
