# 🎓 StudyOS Monorepo

> **StudyOS** is an end-to-end, production-grade Smart Exam & Study Infrastructure platform built with NestJS, Next.js 14, PostgreSQL (Prisma ORM), TailwindCSS, and TypeScript.

---

## 👤 Author & Creator

This project was designed and created by **[sukhwinder-i0](https://github.com/sukhwinder-i0)**.

- **GitHub Profile**: [https://github.com/sukhwinder-i0](https://github.com/sukhwinder-i0)
- **Repository Link**: [https://github.com/sukhwinder-i0/os4study](https://github.com/sukhwinder-i0/os4study)

---

## 📜 License

This project is open-source software licensed under the **[MIT License](LICENSE)**.
Copyright (c) 2026 **Sukhwinder Singh ([sukhwinder-i0](https://github.com/sukhwinder-i0))**.

---

## 📁 Repository Structure

This monorepo is managed using **pnpm workspaces**:

```text
os4study/
├── apps/
│   ├── api/                 # NestJS 10 REST API Service
│   │   ├── .env.example     # API environment template
│   │   └── src/             # NestJS modules (Auth, Exams, Notes, AI, Storage)
│   └── web/                 # Next.js 14 Web Frontend Client
│       ├── .env.example     # Web frontend environment template
│       └── src/             # React App Router pages & components
├── packages/
│   ├── database/            # Prisma ORM schema, client & migrations
│   │   └── prisma/schema.prisma
│   └── shared/              # Shared TypeScript types, DTOs & schemas
├── docker/
│   └── docker-compose.yml   # PostgreSQL + pgvector & Redis containers
├── .env.example             # Global root environment variable template
├── .env                     # Local environment configuration
├── LICENSE                  # MIT License
└── package.json             # Workspace scripts & dependencies
```

---

## ⚙️ Environment Configuration (`.env`)

StudyOS requires environment configuration for local development and production deployments. Sample `.env.example` templates are provided across the repository.

### 1. Root Environment File (`.env`)

Copy `.env.example` to `.env` in the repository root:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment (`development` \| `production` \| `test`) | `development` |
| `PORT` | NestJS API HTTP Listening Port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string for Prisma ORM | `postgresql://postgres:postgrespassword@localhost:5432/studyos?schema=public` |
| `JWT_SECRET` | Secret key for JWT session token authentication | *Random secure string (32+ chars)* |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `CORS_ORIGIN` | Allowed HTTP origin for browser clients | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Web client backend API endpoint base URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_APP_URL` | Web client app base URL | `http://localhost:3000` |
| `AI_PROVIDER` | AI provider integration (`mock` \| `openai`) | `mock` |
| `OPENAI_API_KEY` | OpenAI API key (required if `AI_PROVIDER=openai`) | `sk-...` |
| `OPENAI_MODEL` | OpenAI LLM model ID | `gpt-4o-mini` |
| `STORAGE_PROVIDER` | Storage backend (`local` \| `s3`) | `local` |
| `STORAGE_LOCAL_PATH` | Storage folder path for local uploads | `./uploads` |
| `S3_BUCKET` | AWS S3 Bucket name | `studyos-storage` |
| `S3_REGION` | AWS S3 Region | `us-east-1` |
| `S3_ACCESS_KEY_ID` | AWS IAM Access Key ID | `AKIA...` |
| `S3_SECRET_ACCESS_KEY` | AWS IAM Secret Access Key | `...` |

---

### 2. Frontend Web Environment (`apps/web/.env.local`)

Copy `apps/web/.env.example` to `apps/web/.env.local`:

```bash
cp apps/web/.env.example apps/web/.env.local
```

```ini
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="StudyOS"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

---

### 3. Backend API Environment (`apps/api/.env`)

Copy `apps/api/.env.example` to `apps/api/.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

```ini
NODE_ENV=development
PORT=3001
CORS_ORIGIN="http://localhost:3000"
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/studyos?schema=public"
JWT_SECRET="studyos-dev-jwt-secret"
AI_PROVIDER=mock
STORAGE_PROVIDER=local
```

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: `v18.x` or `v20.x`+
- **pnpm**: `v9.x`+ (`npm i -g pnpm`)
- **Docker**: For local PostgreSQL database and Redis

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Start Database Services (Docker)

```bash
pnpm db:docker
```

### Step 3: Run Database Migrations & Seeds

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### Step 4: Run Development Servers

Run backend API and web frontend concurrently:

```bash
# Terminal 1 - Start API Server (http://localhost:3001/api)
pnpm dev:api

# Terminal 2 - Start Web Frontend (http://localhost:3000)
pnpm dev:web
```

---

## 📖 Interactive OpenAPI / Swagger Documentation

When running the API server, interactive Swagger documentation is automatically generated:

- **Swagger UI**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **API Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)
- **API System Info**: [http://localhost:3001/api](http://localhost:3001/api)

---

## 🛠️ Monorepo Scripts Reference

| Command | Description |
| :--- | :--- |
| `pnpm dev:api` | Starts the NestJS API server in development mode with hot-reloading |
| `pnpm dev:web` | Starts the Next.js Web frontend server |
| `pnpm build` | Recursively builds all apps and workspace packages |
| `pnpm lint` | Runs ESLint across all packages and apps |
| `pnpm typecheck` | Validates TypeScript types across the monorepo |
| `pnpm test` | Runs Jest unit tests across packages |
| `pnpm db:generate` | Generates Prisma Client types from `schema.prisma` |
| `pnpm db:migrate` | Runs database migrations |
| `pnpm db:seed` | Seeds database with initial demo data |

---

<p center align="center">
  Crafted with ❤️ by <a href="https://github.com/sukhwinder-i0"><strong>sukhwinder-i0</strong></a>
</p>
