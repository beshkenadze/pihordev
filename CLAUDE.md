# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pihordev is a cloud platform for running autonomous AI coding agents on tasks in git repositories. Agents work in isolated OpenSandbox containers, users observe/interact via WebSocket chat, and an analytics dashboard aggregates telemetry. Agents build project knowledge over time via Mastra-based semantic memory and codebase GraphRAG.

License: MIT. Repository: github.com/beshkenadze/pihordev (public).

## Commands

```bash
# Install
bun install

# Build all packages (respects turbo dependency graph)
bun turbo build

# Dev (Next.js web app)
bun turbo dev --filter=web

# Lint & format (Biome v2 — replaces ESLint + Prettier)
bun biome check .
bun biome check --write .          # auto-fix

# Type check
bun turbo typecheck

# Tests
bun turbo test:unit                 # unit tests (Vitest)
bun turbo test:integration          # integration tests (needs PostgreSQL)
bun turbo test:e2e                  # E2E (Playwright, needs running app + DB)

# Run tests for a single package
bun turbo test:unit --filter=memory
bun turbo test:unit --filter=agent

# Database (ZenStack v3, Kysely engine — no Prisma)
bun turbo db:migrate                # run migrations
bun turbo db:seed                   # seed data

# Docker (local dev services)
docker compose -f docker/docker-compose.yml up -d   # PostgreSQL (timescaledb-ha:pg16 with pgvector+pgvectorscale) + OpenSandbox
```

## Architecture

Bun workspaces + Turborepo monorepo.

### Apps

- **`apps/web`** — Next.js 15 App Router. Dashboard UI + agent chat + API routes (`/api/auth/[...all]`, `/api/v1/...`). Uses shadcn/ui, AI elements for chat, Tremor for charts.
- **`apps/agent-worker`** — Sidequest.js worker process that dequeues tasks and spawns agent sandboxes.

### Packages

- **`packages/db`** — ZenStack v3 schema (`.zmodel`) + client. Kysely engine, no Prisma. Encryption plugin for sensitive fields. Better-auth integration for ACL.
- **`packages/auth`** — better-auth with organization plugin (teams) + passkey plugin. Roles: owner, admin, member.
- **`packages/agent`** — AgentManager: creates OpenSandbox, clones repo, writes skills, starts pi-coding-agent session with memory extension. TelemetryCollector records events.
- **`packages/memory`** — Mastra-based. Three layers: working memory (structured JSON per project), semantic recall (cross-task RAG via PgVector), codebase GraphRAG (indexed repo docs). Pi extension injects all three into agent context via `before_agent_start`.
- **`packages/queue`** — Sidequest.js on PostgreSQL backend. Per-org concurrency limits. AgentStartJob triggers AgentManager.
- **`packages/ws`** — WebSocket gateway. Server→Browser: `agent_event`, `agent_status`, `agent_attention`. Browser→Server: `steer`, `followUp`, `abort`, `set_model`.
- **`packages/analytics`** — Kysely queries over telemetry tables for dashboard.
- **`packages/email`** — React Email templates + Resend for transactional email (registration, invites).
- **`packages/shared`** — Types, constants (model pricing), utilities.

### Key Data Flow

```
User creates task → Sidequest queue → agent-worker dequeues →
  AgentManager: create sandbox → clone repo → write skills →
  inject memory (working + semantic recall + GraphRAG) →
  start pi-coding-agent → events stream via WebSocket to browser
```

## Tech Decisions

- **Runtime & PM**: Bun (not Node.js, not npm/pnpm)
- **ORM**: ZenStack v3 with Kysely engine — NOT Prisma. Schema lives in `.zmodel` files.
- **Auth**: better-auth with org + passkey plugins — NOT NextAuth/Auth.js
- **Linting**: Biome v2 — NOT ESLint/Prettier
- **Memory**: Mastra SDK (`@mastra/memory`, `@mastra/rag`, `@mastra/pg`) — NOT custom embeddings
- **Vectors**: PostgreSQL + pgvector + pgvectorscale (StreamingDiskANN). No separate vector DB.
- **Queue**: Sidequest.js on PostgreSQL — NOT BullMQ/Redis
- **Agent runtime**: pi-coding-agent SDK. Tools proxied through OpenSandbox. LLM calls stay server-side (API keys never in sandbox).
- **DB image**: `timescale/timescaledb-ha:pg16` (includes pgvector + pgvectorscale)
- **Validation**: Zod for runtime schemas
- **Styling**: Tailwind CSS v4

## WebSocket Protocol

Auth required on upgrade. Messages are JSON with `type` field.

Server → Browser: `agent_event` (tool calls, output), `agent_status` (running/done/error), `agent_attention` (needs input)

Browser → Server: `steer` (redirect agent), `followUp` (add context), `abort` (kill agent), `set_model` (change LLM)

## Database

Single PostgreSQL instance (timescaledb-ha:pg16) hosts:
- App tables (ZenStack): organization, team, user, member, project, task, agent_instance, api_key
- Telemetry: agent_event, daily_usage, daily_error_summary, daily_tool_usage
- Memory (Mastra): threads, messages, embeddings, working_memory
- Queue (Sidequest.js)
- Vector indexes via pgvectorscale StreamingDiskANN (not HNSW)

Sensitive fields encrypted at rest via ZenStack v3 encryption plugin.

## CI/CD

GitHub Actions:
- **ci.yml** (PR + push to main): lint/format → typecheck → unit tests → integration tests (postgres service) → E2E (Playwright)
- **release.yml** (tag push `v*`): build + push Docker images to ghcr.io

All CI uses `bun install --frozen-lockfile` and `bun turbo` commands.

## Dashboard Pages

Route group `(dashboard)/`: Overview, Usage & Cost, Performance, Errors, Tools & Agents, Live Agents, Projects, Settings (members, teams, API keys).

Auth route group `(auth)/`: Login, Signup, Invite accept.
