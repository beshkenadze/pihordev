# Pihordev MVP — Full Implementation Plan

## Overview

Build the Pihordev agent cloud platform end-to-end: monorepo scaffold, database + auth, memory layer, agent infrastructure, WebSocket chat, project/task CRUD, analytics dashboard, platform skills, and polish.

The platform lets users create projects (linked git repos), submit tasks in natural language, and observe autonomous AI coding agents working in isolated sandboxes via real-time WebSocket chat. Agents build knowledge over time via Mastra-based memory (working memory, semantic recall, codebase GraphRAG).

## Context

- **Stack**: Bun workspaces + Turborepo, Next.js 16, ZenStack v3 (Kysely), better-auth, Mastra SDK, Vitest, Biome v2, Tailwind CSS v4, shadcn/ui, Tremor, PostgreSQL (timescaledb-ha:pg16 with pgvector + pgvectorscale)
- **Specs**: `docs/specs/01-requirements.md` through `04-plan.md`
- **Repo**: github.com/beshkenadze/pihordev (public, MIT)
- **Key API notes (from docs)**:
  - ZenStack v3: `@zenstackhq/orm` + `@zenstackhq/cli`, schema at `zenstack/schema.zmodel`, `zen generate`, `zen migrate dev`
  - better-auth: org plugin `organization({ teams: { enabled: true } })`, passkey plugin, Next.js `serverExternalPackages: ['better-auth']`
  - Mastra memory: `PgStore` + `PgVector` from `@mastra/pg` (both require `id` param), `embedder` property, working memory uses template strings
  - Next.js 16: `proxy.ts` not `middleware.ts`, async request APIs (`await cookies()`, `await headers()`), top-level turbopack config

## Development Approach

- **Testing approach**: TDD (tests first)
- Complete each task fully before moving to the next
- Make small, focused changes
- **CRITICAL: every task MUST include new/updated tests** for code changes in that task
- **CRITICAL: all tests must pass before starting next task**
- **CRITICAL: update this plan file when scope changes during implementation**
- Run tests after each change
- Maintain backward compatibility

## Testing Strategy

- **Unit tests**: Vitest, required for every task
- **Integration tests**: Vitest + testcontainers (PostgreSQL with pgvector)
- **E2E tests**: Playwright (chromium), for core user flows
- **Lint/format**: `bun biome check .`
- All local runs via `bun turbo test:unit` with caching

## Progress Tracking

- Mark completed items with `[x]` immediately when done
- Add newly discovered tasks with ➕ prefix
- Document issues/blockers with ⚠️ prefix
- Update plan if implementation deviates from original scope

---

## Phase 1: Monorepo + OSS Foundation

### Task 1: Initialize Bun workspace and Turborepo

- [ ] `bun init` at root, configure `package.json` with `workspaces: ["apps/*", "packages/*"]`
- [ ] create `bunfig.toml` with workspace config
- [ ] install `turbo` as dev dep, create `turbo.json` with tasks: `build`, `dev`, `typecheck`, `test:unit`, `test:integration`, `test:e2e`, `check` (biome)
- [ ] create `tsconfig.base.json` with strict mode, path aliases (`@repo/*`)
- [ ] verify `bun turbo build` runs (no packages yet, should succeed vacuously)

### Task 2: Configure Biome v2

- [ ] install `@biomejs/biome` as dev dep
- [ ] create `biome.json` with formatter (indent: 2, semicolons), linter rules, organize imports
- [ ] add `check` task to turbo.json: `bun biome check .`
- [ ] verify `bun biome check .` passes on empty workspace

### Task 3: Create package skeletons

- [ ] scaffold `packages/shared` — `package.json`, `tsconfig.json` extends base, `src/index.ts`, `src/types.ts`, `src/constants.ts`
- [ ] scaffold `packages/db` — `package.json`, `tsconfig.json`, `src/index.ts`, `src/client.ts`, `zenstack/schema.zmodel` (empty)
- [ ] scaffold `packages/auth` — `package.json`, `tsconfig.json`, `src/index.ts`, `src/server.ts`, `src/client.ts`
- [ ] scaffold `packages/agent` — `package.json`, `tsconfig.json`, `src/index.ts`, `src/manager.ts`, `src/sandbox-tools.ts`, `src/telemetry.ts`
- [ ] scaffold `packages/memory` — `package.json`, `tsconfig.json`, `src/index.ts`, `src/project-memory.ts`, `src/semantic-recall.ts`, `src/codebase-rag.ts`, `src/indexer.ts`, `src/pi-extension.ts`
- [ ] scaffold `packages/queue` — `package.json`, `tsconfig.json`, `src/index.ts`, `src/config.ts`, `src/jobs/agent-start.ts`
- [ ] scaffold `packages/ws` — `package.json`, `tsconfig.json`, `src/index.ts`, `src/gateway.ts`, `src/protocol.ts`
- [ ] scaffold `packages/analytics` — `package.json`, `tsconfig.json`, `src/index.ts`, `src/queries.ts`
- [ ] scaffold `packages/email` — `package.json`, `tsconfig.json`, `src/index.ts`, `src/send.ts`, `src/templates/`
- [ ] verify `bun turbo build` passes, `bun turbo typecheck` passes

### Task 4: Create app skeletons

- [ ] `apps/web`: init Next.js 16 app with App Router, `package.json`, `tsconfig.json`, `next.config.ts` (with `serverExternalPackages: ['better-auth']`, top-level turbopack config)
- [ ] create route group stubs: `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `app/(dashboard)/page.tsx`, `app/(dashboard)/layout.tsx`
- [ ] `apps/agent-worker`: scaffold with `package.json`, `tsconfig.json`, `src/index.ts`, `src/worker.ts`
- [ ] verify `bun turbo build` passes for both apps

### Task 5: Docker Compose + OSS files

- [ ] create `docker/docker-compose.yml` with `timescale/timescaledb-ha:pg16` (port 5432) and `opensandbox/server:latest` (port 8080)
- [ ] create `docker/agent-base/Dockerfile` stub (Node.js + git base image)
- [ ] create `LICENSE` (MIT)
- [ ] create `CONTRIBUTING.md` (dev setup, PR process, commit conventions)
- [ ] create `CODE_OF_CONDUCT.md` (Contributor Covenant)
- [ ] create `README.md` with project overview, architecture section (placeholder for Mermaid diagram), quick start
- [ ] create `.github/ISSUE_TEMPLATE/bug.yml` and `feature.yml`
- [ ] create `.github/PULL_REQUEST_TEMPLATE.md`

### Task 6: GitHub Actions CI/CD

- [ ] create `.github/workflows/ci.yml` — jobs: check (biome), typecheck, test-unit, test-integration (postgres service), test-e2e (playwright)
- [ ] create `.github/workflows/release.yml` — on tag `v*`: build + push Docker images to ghcr.io
- [ ] write test for CI config validity (ensure turbo tasks referenced exist)
- [ ] verify `bun turbo build` and `bun biome check .` pass locally
- [ ] push and verify CI green

### Task 7: Seed data scaffold

- [ ] create `seed/seed.ts` with placeholder structure (org, teams, users, projects, tasks, telemetry)
- [ ] add `db:seed` script to root `package.json` pointing to seed file
- [ ] verify seed file compiles

---

## Phase 2: Database + Auth

### Task 8: ZenStack v3 schema — app tables

- [ ] install `@zenstackhq/orm`, `@zenstackhq/cli`, `pg` driver in `packages/db`
- [ ] define ZModel schema: `organization`, `team`, `user`, `member`, `project`, `task`, `agent_instance`, `api_key`
- [ ] add ZenStack encryption plugin config for sensitive fields (api_key values)
- [ ] run `zen generate` — verify TypeScript client generated
- [ ] write tests for schema validation (field types, relations)
- [ ] run tests — must pass before next task

### Task 9: ZenStack v3 schema — telemetry tables

- [ ] add to schema: `agent_event`, `daily_usage`, `daily_error_summary`, `daily_tool_usage`
- [ ] configure access control rules (@@allow/@@deny) for org-scoped reads
- [ ] run `zen generate`
- [ ] write tests for ACL rules (owner/admin/member access)
- [ ] run tests — must pass before next task

### Task 10: ZenStack client + migrations

- [ ] implement `packages/db/src/client.ts` — initialize ZenStackClient with Kysely PostgresDialect
- [ ] export enhanced client with access control via `createEnhancedClient`
- [ ] run `zen migrate dev` to create initial migration
- [ ] write integration test: connect to testcontainer PostgreSQL, create org, create user, verify roundtrip
- [ ] write integration test: encrypted field roundtrip (api_key)
- [ ] run tests — must pass before next task

### Task 11: better-auth server config

- [ ] install `better-auth` in `packages/auth`
- [ ] implement `src/server.ts`: `betterAuth()` with organization plugin (`teams: { enabled: true }`), passkey plugin, email+password provider
- [ ] configure roles: owner, admin, member with access controller
- [ ] integrate with ZenStack (better-auth adapter)
- [ ] write tests for auth config initialization (plugins loaded, roles defined)
- [ ] run tests — must pass before next task

### Task 12: better-auth client config

- [ ] implement `packages/auth/src/client.ts`: `createAuthClient()` with `organizationClient({ teams: { enabled: true } })`, `passkeyClient()`
- [ ] export typed auth client
- [ ] write tests for client initialization
- [ ] run tests — must pass before next task

### Task 13: Email templates + Resend

- [ ] install `react-email`, `@react-email/components`, `resend` in `packages/email`
- [ ] create templates: `verification.tsx`, `invite.tsx`, `password-reset.tsx`
- [ ] implement `src/send.ts` with Resend transport
- [ ] write tests for template rendering (snapshot tests)
- [ ] write tests for send function (mock Resend API)
- [ ] run tests — must pass before next task

### Task 14: Auth API routes + pages

- [ ] create `apps/web/app/api/auth/[...all]/route.ts` — mount better-auth handler
- [ ] create `apps/web/app/(auth)/login/page.tsx` — email/password + passkey login
- [ ] create `apps/web/app/(auth)/signup/page.tsx` — email registration (sends verification email)
- [ ] create `apps/web/app/(auth)/invite/[id]/page.tsx` — accept org invite
- [ ] create `apps/web/app/proxy.ts` — auth middleware using better-auth (Next.js 16 proxy)
- [ ] write integration test: signup → verify email → login → session valid
- [ ] write integration test: create org → invite member → accept → member role
- [ ] run tests — must pass before next task

---

## Phase 3: Memory Layer

### Task 15: Project working memory

- [ ] install `@mastra/memory`, `@mastra/pg` in `packages/memory`
- [ ] implement `src/project-memory.ts`: `createProjectMemory()` using `Memory` with `PgStore`, `PgVector` (both with `id` param), `embedder: 'openai/text-embedding-3-small'`
- [ ] configure working memory with template string (tech stack, conventions, deployment config, team rules, known issues, completed features)
- [ ] configure semantic recall: `topK: 5`, `messageRange: 2`, `scope: 'resource'`
- [ ] write tests for memory creation (mock PgStore/PgVector)
- [ ] write tests for working memory template structure
- [ ] run tests — must pass before next task

### Task 16: Semantic recall

- [ ] implement `src/semantic-recall.ts`: helper to search past task conversations by project
- [ ] cross-thread search scoped by `resourceId = projectId`
- [ ] write tests for recall query construction
- [ ] write integration test with testcontainer PostgreSQL: store messages across threads, verify cross-thread recall
- [ ] run tests — must pass before next task

### Task 17: Codebase indexer + GraphRAG

- [ ] install `@mastra/rag` in `packages/memory`
- [ ] implement `src/indexer.ts`: `collectIndexableFiles()` (README, docs, configs), `indexCodebase()` using `MDocument.fromText`, chunk (recursive, size 512, overlap 50), embed, upsert to PgVector
- [ ] implement `src/codebase-rag.ts`: `createCodebaseRAGTool()` using `createGraphRAGTool`
- [ ] write tests for `collectIndexableFiles` (mock fs, verify file patterns)
- [ ] write tests for chunk/embed pipeline (mock embeddings)
- [ ] write integration test: index small repo docs → query → verify ranked results
- [ ] run tests — must pass before next task

### Task 18: Pi memory extension

- [ ] implement `src/pi-extension.ts`: `createMemoryExtension(projectId, memory)`
- [ ] `before_agent_start`: load working memory, semantic recall with task description, inject into system prompt
- [ ] `agent_end`: on completion, save task summary to memory
- [ ] write tests for `before_agent_start` hook (mock memory, verify prompt content)
- [ ] write tests for `agent_end` hook (mock memory, verify message saved)
- [ ] run tests — must pass before next task

---

## Phase 4: Agent Infrastructure

### Task 19: Agent base Docker image

- [ ] implement `docker/agent-base/Dockerfile`: Node.js LTS + git + common dev tools
- [ ] add build target in `docker-compose.yml` for local testing
- [ ] verify image builds: `docker build -t agent-base docker/agent-base/`

### Task 20: Sandbox tool proxying

- [ ] implement `packages/agent/src/sandbox-tools.ts`: `sandboxBashTool`, `sandboxReadTool`, `sandboxWriteTool`, `sandboxEditTool` — all proxy through OpenSandbox SDK
- [ ] write tests for each tool: correct command forwarding, timeout handling, non-zero exit codes
- [ ] write tests for error cases: sandbox unavailable, permission denied
- [ ] run tests — must pass before next task

### Task 21: Telemetry collector

- [ ] implement `packages/agent/src/telemetry.ts`: `TelemetryCollector` class — records agent events to DB
- [ ] event types: tool_call, llm_request, llm_response, error, completion
- [ ] implement cost calculation (model pricing from `packages/shared/src/constants.ts`)
- [ ] write tests for event recording (mock DB)
- [ ] write tests for cost calculator: known models, unknown model fallback, zero tokens, cached token pricing
- [ ] run tests — must pass before next task

### Task 22: Model pricing constants

- [ ] implement `packages/shared/src/constants.ts`: pricing table for supported models (Anthropic, OpenAI, Google, etc.)
- [ ] implement `packages/shared/src/types.ts`: shared TypeScript types (AgentEvent, TaskStatus, WebSocketMessage, etc.)
- [ ] write tests for pricing lookup (known model, unknown, edge cases)
- [ ] run tests — must pass before next task

### Task 23: AgentManager

- [ ] implement `packages/agent/src/manager.ts`: `AgentManager` class
- [ ] `startAgent(task, project, org)`: create sandbox → clone repo → checkout branch → write skills + AGENTS.md → index codebase if needed → create memory → start pi-coding-agent session → subscribe to events → broadcast via telemetry
- [ ] `stopAgent(taskId)`: kill sandbox, update task status
- [ ] write tests for startAgent flow (mock sandbox, memory, pi-coding-agent)
- [ ] write tests for stopAgent (verify cleanup)
- [ ] write tests for error handling (sandbox creation failure, clone failure)
- [ ] run tests — must pass before next task

### Task 24: Task queue (Sidequest.js)

- [ ] install `sidequest` in `packages/queue`
- [ ] implement `src/config.ts`: Sidequest instance with PostgreSQL backend, per-org concurrency limits
- [ ] implement `src/jobs/agent-start.ts`: job handler calls `agentManager.startAgent()`
- [ ] write tests for job handler: happy path, task not found, retry on failure
- [ ] write tests for concurrency limit enforcement
- [ ] run tests — must pass before next task

### Task 25: Agent integration test

- [ ] write integration test: enqueue task → worker picks up → sandbox created → clone → agent starts → events emitted → agent stops → task status updated
- [ ] write integration test: multiple concurrent agents (verify isolation)
- [ ] write integration test: agent error → task status = error
- [ ] run tests — must pass before next task

---

## Phase 5: WebSocket + Chat UI

### Task 26: WebSocket protocol types

- [ ] implement `packages/ws/src/protocol.ts`: TypeScript types for all message types
- [ ] server→browser: `agent_event`, `agent_status`, `agent_attention`
- [ ] browser→server: `steer`, `followUp`, `abort`, `set_model`
- [ ] Zod schemas for message validation
- [ ] write tests for message validation (valid/invalid payloads)
- [ ] run tests — must pass before next task

### Task 27: WebSocket gateway

- [ ] install `ws` in `packages/ws`
- [ ] implement `src/gateway.ts`: `WebSocketGateway` class — upgrade handler with auth check, room management (per taskId), message routing
- [ ] wire: incoming `steer`/`followUp`/`abort`/`set_model` → AgentManager
- [ ] wire: AgentManager events → broadcast to task room
- [ ] write tests for: auth rejection, join room, leave room, broadcast, message routing
- [ ] write tests for: disconnect handling, reconnection
- [ ] run tests — must pass before next task

### Task 28: shadcn/ui + Tailwind CSS v4 setup

- [ ] install shadcn/ui in `apps/web`: `bunx shadcn@latest init`
- [ ] install Tailwind CSS v4
- [ ] configure dark mode (class strategy)
- [ ] add base components: Button, Card, Input, Dialog, Sheet, Tabs, Table, Badge, Avatar, Tooltip (with TooltipProvider at layout root)
- [ ] install Geist font (sans + mono) via `next/font`
- [ ] verify components render in dev

### Task 29: Agent chat UI

- [ ] install AI elements: `bunx ai-elements@latest`
- [ ] create `apps/web/components/agent/chat.tsx`: message list (streaming, tool cards), input bar (steer/follow-up), status indicator
- [ ] create `apps/web/components/agent/status-badge.tsx`: running/done/error/attention states
- [ ] wire WebSocket connection (connect on mount, reconnect on disconnect)
- [ ] write tests for chat component (mock WS, verify message rendering)
- [ ] write tests for status transitions
- [ ] run tests — must pass before next task

### Task 30: Agent list page

- [ ] create `apps/web/app/(dashboard)/agents/page.tsx`: list of active agents with status, model, token count
- [ ] create `apps/web/app/(dashboard)/agents/[taskId]/page.tsx`: agent chat page (uses chat component)
- [ ] write tests for agent list (mock data, verify rendering)
- [ ] run tests — must pass before next task

---

## Phase 6: Projects + Tasks

### Task 31: Project API + CRUD

- [ ] create API routes: `POST /api/v1/projects`, `GET /api/v1/projects`, `GET /api/v1/projects/[id]`, `PUT /api/v1/projects/[id]`, `DELETE /api/v1/projects/[id]`
- [ ] validate repo URL format
- [ ] auth required, org-scoped access control via ZenStack
- [ ] write tests for each endpoint (success + auth failure + validation error)
- [ ] run tests — must pass before next task

### Task 32: Task API + CRUD + enqueue

- [ ] create API routes: `POST /api/v1/tasks`, `GET /api/v1/tasks`, `GET /api/v1/tasks/[id]`, `PUT /api/v1/tasks/[id]`
- [ ] on task creation: validate, insert to DB, enqueue via Sidequest
- [ ] write tests for each endpoint
- [ ] write tests for enqueue-on-create flow (mock queue)
- [ ] run tests — must pass before next task

### Task 33: Project pages

- [ ] create `apps/web/app/(dashboard)/projects/page.tsx`: project list with status indicators
- [ ] create `apps/web/app/(dashboard)/projects/new/page.tsx`: create project form (repo URL, name, description)
- [ ] create `apps/web/app/(dashboard)/projects/[id]/page.tsx`: project detail (tasks, settings, memory status)
- [ ] write tests for project pages (mock API data)
- [ ] run tests — must pass before next task

### Task 34: Task pages

- [ ] create task creation form (within project detail or separate page): title, description, model selector
- [ ] create task board/list view within project
- [ ] wire: create task → API → enqueue → redirect to agent chat
- [ ] write tests for task creation flow
- [ ] run tests — must pass before next task

---

## Phase 7: Analytics Dashboard

### Task 35: Analytics queries

- [ ] implement `packages/analytics/src/queries.ts`: Kysely queries for each dashboard metric
- [ ] queries: daily usage (tasks, tokens, cost), performance (p50/p95 latency, success rate), errors (grouped by type), tool usage (frequency, success rate)
- [ ] all queries: time range filter, org scope, group-by support
- [ ] write tests for each query (mock Kysely, verify SQL construction)
- [ ] write tests for edge cases: empty results, single day, full range
- [ ] run tests — must pass before next task

### Task 36: Analytics API routes

- [ ] create API routes: `GET /api/v1/analytics/overview`, `GET /api/v1/analytics/usage`, `GET /api/v1/analytics/performance`, `GET /api/v1/analytics/errors`, `GET /api/v1/analytics/tools`
- [ ] query params: `from`, `to`, `groupBy` (day/week/month)
- [ ] auth required, org-scoped
- [ ] write tests for each endpoint
- [ ] run tests — must pass before next task

### Task 37: Seed data generator

- [ ] implement `seed/seed.ts`: generate 1 org, 3 teams, 8 users, 5 projects, 30 tasks, 30 days of telemetry data
- [ ] include realistic distributions (varying daily counts, error rates, cost)
- [ ] include small pre-indexed repo for memory integration
- [ ] verify seed runs against local DB

### Task 38: Overview dashboard page

- [ ] install Tremor in `apps/web`
- [ ] create `apps/web/app/(dashboard)/page.tsx`: KPI cards (total tasks, success rate, avg cost, active agents) + Tremor line/bar charts (daily usage trend)
- [ ] create `apps/web/components/dashboard/kpi-card.tsx`, `components/dashboard/usage-chart.tsx`
- [ ] wire to analytics API
- [ ] write tests for dashboard components (mock data)
- [ ] run tests — must pass before next task

### Task 39: Remaining dashboard pages

- [ ] `apps/web/app/(dashboard)/usage/page.tsx`: usage & cost breakdown (by project, team, model) with Tremor charts
- [ ] `apps/web/app/(dashboard)/performance/page.tsx`: latency percentiles, success rate over time
- [ ] `apps/web/app/(dashboard)/errors/page.tsx`: error table grouped by type, sparklines
- [ ] `apps/web/app/(dashboard)/tools/page.tsx`: tool usage frequency, agent model distribution
- [ ] write tests for each page
- [ ] run tests — must pass before next task

---

## Phase 8: Skills + Settings

### Task 40: Platform skills

- [ ] create `skills/git-workflow/SKILL.md`: branch naming, commit conventions, PR workflow
- [ ] create `skills/test-runner/SKILL.md`: detect test framework, run tests, report results
- [ ] create `skills/code-review/SKILL.md`: review checklist, suggest improvements
- [ ] create `skills/dependency-mgmt/SKILL.md`: update deps, check vulnerabilities
- [ ] create `skills/project-setup/SKILL.md`: detect stack, scaffold configs
- [ ] create platform `AGENTS.md` template (injected into each sandbox)

### Task 41: Settings — org, members, teams

- [ ] create `apps/web/app/(dashboard)/settings/page.tsx`: org settings (name, default model)
- [ ] create `apps/web/app/(dashboard)/settings/members/page.tsx`: member list, invite form, role management
- [ ] create `apps/web/app/(dashboard)/settings/teams/page.tsx`: team CRUD, assign members
- [ ] wire to better-auth organization APIs
- [ ] write tests for settings pages
- [ ] run tests — must pass before next task

### Task 42: API key management

- [ ] create `apps/web/app/(dashboard)/settings/api-keys/page.tsx`: list, create, revoke API keys
- [ ] API routes: `POST /api/v1/api-keys`, `GET /api/v1/api-keys`, `DELETE /api/v1/api-keys/[id]`
- [ ] keys stored encrypted (ZenStack encryption plugin)
- [ ] show key value only once on creation
- [ ] write tests for API key CRUD + encryption roundtrip
- [ ] run tests — must pass before next task

### Task 43: Auth pages polish

- [ ] polish login page: email/password form + passkey button
- [ ] polish signup page: email registration with validation
- [ ] implement passkey enrollment in profile settings
- [ ] implement org invite email flow (Resend)
- [ ] write tests for passkey enrollment flow
- [ ] run tests — must pass before next task

---

## Phase 9: Polish + Testing + OSS

### Task 44: Access control verification

- [ ] write integration tests: owner can CRUD everything in org
- [ ] write integration tests: admin can manage projects/tasks but not billing
- [ ] write integration tests: member can create tasks, view dashboard, but not manage org
- [ ] write integration tests: cross-org isolation (user in org A cannot see org B data)
- [ ] run tests — must pass before next task

### Task 45: Loading, empty, and error states

- [ ] add loading skeletons to all dashboard pages
- [ ] add empty states (no projects, no tasks, no telemetry)
- [ ] add error boundaries with retry
- [ ] add 404 page
- [ ] write tests for empty state rendering
- [ ] run tests — must pass before next task

### Task 46: Dark mode

- [ ] ensure all components support dark mode via `className="dark"` on `<html>`
- [ ] add theme toggle in dashboard layout header
- [ ] verify Tremor charts + shadcn/ui + custom components in dark mode
- [ ] write tests for theme toggle

### Task 47: E2E tests

- [ ] install Playwright in `apps/web`
- [ ] write E2E: login → overview dashboard → KPI cards visible
- [ ] write E2E: create project → create task → agent starts → chat page shows messages
- [ ] write E2E: send steer message → appears in chat
- [ ] write E2E: navigate all dashboard pages
- [ ] write E2E: invite member, create API key
- [ ] run all E2E tests — must pass before next task

### Task 48: Verify acceptance criteria

- [ ] verify all requirements from specs are implemented
- [ ] verify edge cases are handled
- [ ] run full test suite: `bun turbo test:unit`
- [ ] run integration tests: `bun turbo test:integration`
- [ ] run E2E tests: `bun turbo test:e2e`
- [ ] run linter: `bun biome check .` — all issues must be fixed
- [ ] verify test coverage meets 80%+ on packages/

### Task 49: README + docs + OSS polish

- [ ] update README.md: architecture diagram (Mermaid), quick start, env vars table, screenshots placeholders
- [ ] update CONTRIBUTING.md: dev setup, testing, PR guidelines, commit conventions
- [ ] create `.env.example` with all required env vars documented
- [ ] document: what's implemented vs what's production-only (system design section of specs)

### Task 50: [Final] Release

- [ ] git cleanup, ensure all tests pass
- [ ] tag `v0.1.0`
- [ ] verify release workflow triggers and Docker images publish to ghcr.io
- [ ] verify README renders correctly on GitHub

---

## Technical Details

### Environment Variables

```
DATABASE_URL=postgres://dev:dev@localhost:5432/pihordev
BETTER_AUTH_SECRET=<random>
RESEND_API_KEY=<resend-key>
OPENAI_API_KEY=<openai-key>  # for embeddings
OPENSANDBOX_URL=http://localhost:8080
ENCRYPTION_KEY=<32-byte-hex>  # ZenStack field encryption
```

### ZenStack Client Initialization

```typescript
import { ZenStackClient } from '@zenstackhq/orm';
import { PostgresDialect } from '@zenstackhq/orm/dialects';
import pg from 'pg';

const client = new ZenStackClient({
  dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString: process.env.DATABASE_URL }) }),
});
```

### Mastra Memory Initialization

```typescript
import { Memory } from '@mastra/memory';
import { PgStore, PgVector } from '@mastra/pg';

const memory = new Memory({
  storage: new PgStore({ id: 'project-storage', connectionString: process.env.DATABASE_URL }),
  vector: new PgVector({ id: 'project-vector', connectionString: process.env.DATABASE_URL }),
  embedder: 'openai/text-embedding-3-small',
  options: {
    lastMessages: 20,
    semanticRecall: { topK: 5, messageRange: 2, scope: 'resource' },
    workingMemory: { enabled: true, template: `<project>...</project>` },
  },
});
```

### better-auth Server Config

```typescript
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';

export const auth = betterAuth({
  plugins: [organization({ teams: { enabled: true, maximumTeams: 10 } })],
});
```

## Post-Completion

**Manual verification:**
- Full user journey: signup → create org → create project → create task → watch agent work → view dashboard
- WebSocket reconnection under network disruption
- Concurrent agent stress test (5+ agents simultaneously)

**External system updates:**
- Configure GitHub Actions secrets: `TURBO_TOKEN`, `TURBO_TEAM` (optional remote caching)
- Set up Resend domain verification for production email
- Configure OpenSandbox production endpoint
