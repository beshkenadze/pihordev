# Pihordev

Cloud platform for running autonomous AI coding agents on tasks in git repositories.

Agents work in isolated sandboxes, users observe and interact via WebSocket chat, and an analytics dashboard aggregates telemetry. Agents build project knowledge over time via semantic memory and codebase RAG.

**License:** MIT | **Runtime:** Bun | **Repository:** [github.com/beshkenadze/pihordev](https://github.com/beshkenadze/pihordev)

---

## Table of Contents

- [System Design](#system-design)
- [Core Concepts](#core-concepts)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [Agent Lifecycle](#agent-lifecycle)
- [Memory System](#memory-system)
- [WebSocket Protocol](#websocket-protocol)
- [Authentication & Authorization](#authentication--authorization)
- [Data Model](#data-model)
- [Analytics Dashboard](#analytics-dashboard)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Testing Strategy](#testing-strategy)
- [CI/CD](#cicd)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Production Roadmap](#production-roadmap)

---

## System Design

```mermaid
graph TD
    subgraph Browser
        UI[Dashboard / Chat UI]
    end

    subgraph "Web App (Next.js)"
        API[API Routes]
        WS[WebSocket Gateway]
        Auth[better-auth]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL<br/>timescaledb-ha:pg16)]
        Vec[(pgvector +<br/>pgvectorscale)]
    end

    subgraph "Agent Infrastructure"
        Queue[Sidequest.js Queue]
        Worker[Agent Worker]
        Sandbox[OpenSandbox Container]
        PiAgent[pi-coding-agent]
    end

    subgraph "Memory Layer (Mastra)"
        WM[Working Memory]
        SR[Semantic Recall]
        GRAG[Codebase GraphRAG]
    end

    subgraph "External"
        LLM[LLM Providers]
        Git[Git Repository]
        Email[Resend]
    end

    UI -->|HTTP| API
    UI -->|WebSocket| WS
    API --> Auth
    API --> DB
    API -->|Create Task| Queue
    Queue -->|Dequeue| Worker
    Worker -->|Spawn| Sandbox
    Sandbox --> PiAgent
    PiAgent -->|LLM calls server-side| LLM
    Worker -->|Clone| Git
    Worker -->|Events| WS
    WS -->|Stream| UI
    Worker --> WM
    Worker --> SR
    Worker --> GRAG
    WM --> DB
    SR --> Vec
    GRAG --> Vec
    Auth --> Email
```

---

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Project** | Linked git repository with persistent memory (working memory + codebase index) |
| **Task** | Feature or bug described in natural language; one agent per task |
| **Agent** | pi-coding-agent running inside an isolated OpenSandbox container, enriched with project memory |
| **Session** | Live WebSocket connection between browser and running agent |

### Users

| Persona | Needs | Views |
|---------|-------|-------|
| Org Admin | Spend control, team comparison, adoption metrics, error monitoring | Org dashboard, projects |
| Team Lead | Team throughput, agent utilization, cost per project | Team dashboard, task board |
| Developer | Create tasks, observe agents in real-time, intervene when needed | Task creation, live chat |

---

## Architecture

### Current State

Single Next.js 16 application at the repository root, running on Bun.

| Path | Purpose |
|------|---------|
| `/app` | Routes, layouts, server components, API route handlers |
| `/components` | Reusable UI components (shadcn/ui, charts, dashboard, agent) |
| `/lib` | Shared utilities, domain logic, integration helpers |
| `/docker` | Docker Compose (PostgreSQL + OpenSandbox) and agent base image |

### Target Architecture (monorepo)

The project will evolve into a Bun workspaces + Turborepo monorepo with two apps and nine internal packages.

#### Apps

| App | Purpose |
|-----|---------|
| `apps/web` | Next.js 16 App Router — dashboard UI, agent chat, API routes (`/api/auth/[...all]`, `/api/v1/...`) |
| `apps/agent-worker` | Sidequest.js worker process that dequeues tasks and spawns agent sandboxes |

#### Packages

| Package | Purpose |
|---------|---------|
| `packages/db` | ZenStack v3 schema (`.zmodel`) + Kysely client. Encryption plugin for sensitive fields. better-auth integration for ACL |
| `packages/auth` | better-auth with organization plugin (teams) + passkey plugin. Roles: owner, admin, member |
| `packages/agent` | AgentManager: creates sandbox, clones repo, writes skills, starts agent session with memory. TelemetryCollector records events |
| `packages/memory` | Mastra-based three-layer memory: working memory, semantic recall, codebase GraphRAG |
| `packages/queue` | Sidequest.js on PostgreSQL backend. Per-org concurrency limits |
| `packages/ws` | WebSocket gateway for real-time agent ↔ browser communication |
| `packages/analytics` | Kysely queries over telemetry tables for dashboard metrics |
| `packages/email` | React Email templates + Resend for transactional email |
| `packages/shared` | Shared TypeScript types, model pricing constants, utilities |

---

## Data Flow

```
User creates task
  → Sidequest queue (PostgreSQL-backed, per-org concurrency)
  → Agent Worker dequeues
  → AgentManager:
      1. Create OpenSandbox container
      2. Clone git repo → checkout feature branch
      3. Write platform skills + AGENTS.md
      4. Index codebase if first task (README, docs, configs → GraphRAG)
      5. Inject memory: working memory + semantic recall + codebase RAG
      6. Start pi-coding-agent session (LLM calls server-side)
      7. Subscribe to events → stream via WebSocket to browser
  → On completion:
      • Update working memory with learnings
      • Index new code into GraphRAG
      • Record telemetry to dashboard
  → User can connect/disconnect via WebSocket at any time
```

---

## Agent Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Queued: Task created
    Queued --> Starting: Worker dequeues
    Starting --> Running: Sandbox ready + agent started
    Running --> Running: Tool calls, LLM turns
    Running --> Attention: Agent needs input
    Attention --> Running: User sends steer/followUp
    Running --> Completed: Task done
    Running --> Error: Failure
    Completed --> [*]
    Error --> [*]
    Running --> Aborted: User aborts
    Aborted --> [*]
```

**Sandbox isolation:** Each task gets its own OpenSandbox container with a full git clone. Egress allowed, ingress blocked. API keys never enter the sandbox — LLM calls are proxied server-side. Tools (bash, read, write, edit) are proxied through the OpenSandbox SDK.

**Platform skills** injected into every sandbox: `git-workflow`, `test-runner`, `code-review`, `dependency-mgmt`, `project-setup`.

**LLM providers** (via pi-ai): Anthropic, OpenAI, Google Gemini, GitHub Copilot, Z.AI/GLM, OpenRouter, Groq, Ollama.

---

## Memory System

Three layers of memory per project, powered by Mastra SDK:

```mermaid
graph LR
    subgraph "Per-Project Memory"
        WM["Working Memory<br/>(structured JSON)"]
        SR["Semantic Recall<br/>(cross-task RAG)"]
        GR["Codebase GraphRAG<br/>(repo knowledge graph)"]
    end

    WM -->|"Tech stack, conventions,<br/>team rules, known issues"| Agent
    SR -->|"Relevant context from<br/>completed tasks"| Agent
    GR -->|"README, docs, configs<br/>graph traversal"| Agent
    Agent -->|"Update learnings"| WM
    Agent -->|"Save task summary"| SR
```

### Working Memory

Structured JSON scratchpad persisted across tasks. Contains: tech stack, conventions, team rules, deployment config, known issues, completed features. Agent updates it after each task via `updateWorkingMemory` tool. Stored in PostgreSQL via `@mastra/pg`.

### Semantic Recall

RAG over past task conversations. When a new task starts, searches for relevant context from completed tasks in the same project. Cross-thread search scoped by `resourceId = projectId`. Uses pgvector embeddings with `text-embedding-3-small`.

### Codebase GraphRAG

Knowledge graph built from repo docs (README, ARCHITECTURE.md, key configs). Indexed on first clone, re-indexed on significant changes. Combines vector similarity with graph traversal for deeper context retrieval. Uses pgvectorscale StreamingDiskANN index for production-grade filtered search (28x lower p95 latency vs HNSW at scale).

### Memory Injection

All three layers are injected into agent context via the pi extension `before_agent_start` hook. After task completion, `agent_end` hook saves learnings back to memory.

---

## WebSocket Protocol

Auth required on upgrade. Messages are JSON with `type` field.

### Server → Browser

| Type | Description |
|------|-------------|
| `agent_event` | Tool calls, LLM output, streaming content |
| `agent_status` | Status changes: running, done, error |
| `agent_attention` | Agent needs user input |

### Browser → Server

| Type | Description |
|------|-------------|
| `steer` | Redirect agent's approach |
| `followUp` | Add context or instructions |
| `abort` | Kill the running agent |
| `set_model` | Change LLM provider/model |

---

## Authentication & Authorization

Built on **better-auth** with organization plugin (teams enabled) + passkey plugin.

### Auth Flow

- **Registration**: Email signup with verification (React Email + Resend)
- **Login**: Email/password or passkey (WebAuthn)
- **Passkey**: Optional enrollment in profile settings (post-registration)
- **Organizations**: Multi-tenant with invite flow
- **Roles**: owner → admin → member (enforced via ZenStack ACL)

### Access Control (ZenStack v3)

| Role | Permissions |
|------|-------------|
| Owner | Full CRUD on everything in org, billing |
| Admin | Manage projects, tasks, members (not billing) |
| Member | Create tasks, view dashboard, observe agents |

Cross-org isolation enforced at the database layer — users in Org A cannot see Org B data.

---

## Data Model

Single PostgreSQL instance (`timescale/timescaledb-ha:pg16`) hosts all data.

### Dual Data-Access Layer

One database, two clients — a deliberate MVP trade-off. Mastra auto-manages its own schema as part of its API contract.

| Client | Manages | Migrations |
|--------|---------|------------|
| **ZenStack v3** (Kysely) | App data, ACL, encryption | `zen migrate dev` |
| **Mastra** (`PgStore` + `PgVector`) | Memory, threads, embeddings | Auto-created by Mastra |

Both clients share the same `DATABASE_URL`. Queue tables (Sidequest.js) are also auto-managed in the same database.

### App Tables (ZenStack v3)

`organization`, `team`, `user`, `member`, `project`, `task`, `agent_instance`, `api_key`

Sensitive fields (API key values) encrypted at rest via ZenStack v3 encryption plugin.

### Telemetry Tables

`agent_event`, `daily_usage`, `daily_error_summary`, `daily_tool_usage`

### Memory Tables (Mastra)

`threads`, `messages`, `embeddings`, `working_memory`

Vector indexes via pgvectorscale **StreamingDiskANN** (disk-based, not HNSW) for production-grade filtered search on project-scoped embeddings.

### Queue Tables (Sidequest.js)

Job queue metadata stored in the same PostgreSQL instance.

```mermaid
erDiagram
    organization ||--o{ team : has
    organization ||--o{ member : has
    organization ||--o{ project : owns
    user ||--o{ member : "belongs to"
    team ||--o{ member : "grouped in"
    project ||--o{ task : contains
    task ||--o| agent_instance : "runs as"
    agent_instance ||--o{ agent_event : emits
    organization ||--o{ api_key : has
    project ||--o{ working_memory : "memory for"
    project ||--o{ embeddings : "vectors for"
```

---

## Analytics Dashboard

Telemetry from AgentSession events. No OpenTelemetry pipeline — direct Kysely queries over telemetry tables.

### Dashboard Pages

| Page | Metrics |
|------|---------|
| **Overview** | KPI cards (total tasks, success rate, avg cost, active agents), daily usage trend |
| **Usage & Cost** | Breakdown by project, team, model. Token consumption over time |
| **Performance** | p50/p95 latency, success rate over time |
| **Errors** | Error table grouped by type, sparklines |
| **Tools & Agents** | Tool usage frequency, agent model distribution |
| **Live Agents** | Currently running agents with status, model, token count |

### Route Groups

- `(dashboard)/` — Overview, Usage, Performance, Errors, Tools, Live Agents, Projects, Settings
- `(auth)/` — Login, Signup, Invite accept

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime & PM | Bun | Package manager and runtime |
| Monorepo | Turborepo | Build caching, parallel execution |
| Linting | Biome v2 | Replaces ESLint + Prettier |
| Frontend | Next.js 16 (App Router) | SSR, API routes, WebSocket |
| UI Components | shadcn/ui + AI elements | Chat/AI components |
| Charts | Tremor | Dashboard visualizations |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Auth | better-auth | Org + passkey plugins |
| ORM / ACL | ZenStack v3 (Kysely engine) | No Prisma dependency |
| Encryption | ZenStack v3 encryption plugin | Sensitive fields at rest |
| Memory | @mastra/memory | Threads, semantic recall, working memory |
| RAG | @mastra/rag | MDocument, chunking, GraphRAG |
| Vectors | @mastra/pg (pgvector + pgvectorscale) | StreamingDiskANN indexes |
| Database | PostgreSQL (timescaledb-ha:pg16) | App + telemetry + queue + vectors |
| Queue | Sidequest.js | PostgreSQL-backed job queue |
| Agent | pi-coding-agent SDK | Multi-provider LLM, tools, skills |
| Sandbox | Alibaba OpenSandbox | Isolated containers |
| Email | React Email + Resend | Transactional email |
| WebSocket | ws | Real-time communication |
| Validation | Zod | Runtime type validation |
| Testing | Vitest, Playwright, Testing Library | Unit, E2E, component tests |
| CI/CD | GitHub Actions | Lint, test, build, Docker publish |
| Registry | ghcr.io | Docker images |

---

## Project Structure

### Current

```
pihordev/
├── app/                              # Next.js 16 App Router
│   ├── (auth)/                       # Login, signup, invite
│   ├── (dashboard)/                  # Dashboard pages
│   └── api/                          # API routes
├── components/
│   └── ui/                           # shadcn/ui components
├── lib/                              # Utilities (cn, types, etc.)
├── docker/                           # Docker Compose + agent base image
├── docs/                             # Plans and specs
├── packages/
│   ├── db/                           # ZenStack v3 schema + Kysely client
│   └── shared/                       # Types, constants, utilities
├── biome.json
├── next.config.ts
└── package.json
```

### Target (monorepo)

```
pihordev/
├── apps/
│   ├── web/                          # Next.js dashboard + agent chat
│   │   ├── app/
│   │   │   ├── (auth)/               # Login, signup, invite
│   │   │   ├── (dashboard)/          # All dashboard pages
│   │   │   └── api/                  # Auth + v1 API routes
│   │   └── components/
│   │       ├── ui/                   # shadcn/ui
│   │       ├── ai/                   # AI elements (chat)
│   │       ├── charts/               # Tremor
│   │       ├── dashboard/            # KPI cards, usage charts
│   │       └── agent/                # Chat, status badge
│   │
│   └── agent-worker/                 # Sidequest worker process
│
├── packages/
│   ├── db/                           # ZenStack v3 schema + Kysely client
│   ├── auth/                         # better-auth (org + passkey)
│   ├── agent/                        # AgentManager + sandbox tools
│   ├── memory/                       # Mastra memory (3 layers)
│   ├── queue/                        # Sidequest.js config + jobs
│   ├── ws/                           # WebSocket gateway
│   ├── analytics/                    # Dashboard Kysely queries
│   ├── email/                        # React Email + Resend
│   └── shared/                       # Types, constants, utilities
│
├── skills/                           # Platform skills for agents
├── seed/                             # Seed data generator
├── docker/                           # Docker Compose + agent base image
├── .github/                          # CI/CD workflows + templates
├── turbo.json
├── biome.json
└── package.json
```

---

## Testing Strategy

| Level | Tool | Scope | Coverage Target |
|-------|------|-------|-----------------|
| Unit | Vitest | All packages | > 80% |
| Integration | Vitest + testcontainers | DB, auth, agent, memory, API endpoints | All endpoints + agent + memory |
| E2E | Playwright (Chromium) | Core user flows | Critical paths |
| Lint/Format | Biome v2 | Entire codebase | Zero violations |

### Unit Tests

- **agent**: Sandbox tool proxying, timeout/error handling, cost calculation
- **memory**: Working memory CRUD, semantic recall, GraphRAG indexing/querying, pi extension hooks
- **analytics**: Time range queries, group by, percentiles, empty results
- **ws**: Message routing, broadcast, auth rejection, disconnect handling
- **queue**: Job execution, retry, concurrency limits

### Integration Tests

- **agent**: Full lifecycle (start → clone → tools → events → stop), concurrent agents, error recovery
- **memory**: Real PostgreSQL + pgvectorscale: index → recall → verify context injection
- **auth**: Signup → login → passkey enrollment → org invite → role verification
- **db**: ACL enforcement (owner/admin/member), cross-org isolation, encrypted field roundtrip

### E2E Tests

- Login → overview dashboard → KPI cards visible
- Create project → create task → agent starts → chat messages appear
- Send steer message → appears in chat
- Navigate all dashboard pages
- Invite member, create API key

### Seed Data

- 1 org, 3 teams, 8 users, 5 projects, 30 tasks, 30 days of telemetry
- Small pre-indexed repo for memory integration testing

---

## CI/CD

### `ci.yml` — Every PR and push to `main`

```
Lint & Format (Biome) → Type Check → Unit Tests → Integration Tests (PostgreSQL service) → E2E (Playwright)
```

- Concurrency: cancel in-progress runs per branch
- PostgreSQL service: `timescale/timescaledb-ha:pg16` with health checks
- Artifacts: unit coverage, E2E results on failure
- All jobs use `bun install --frozen-lockfile`

### `release.yml` — On tag push (`v*`)

- Build + push Docker images to `ghcr.io`:
  - Main app image
  - Agent base image (Node.js + git + dev tools)
- Uses GitHub Container Registry with build caching

### Branch Protection

- CI must pass before merge
- At least 1 review on PRs
- No direct push to `main`

---

## Quick Start

```bash
# Prerequisites: Bun, Docker

# Install dependencies
bun install

# Start services (PostgreSQL + OpenSandbox)
docker compose -f docker/docker-compose.yml up -d

# Run migrations
bun turbo db:migrate

# Seed data (optional)
bun turbo db:seed

# Dev server
bun turbo dev --filter=web
```

### Common Commands

```bash
bun turbo build                    # Build all packages
bun turbo typecheck                # Type check
bun biome check .                  # Lint & format check
bun biome check --write .          # Auto-fix lint issues
bun turbo test:unit                # Unit tests
bun turbo test:integration         # Integration tests (needs PostgreSQL)
bun turbo test:e2e                 # E2E tests (needs running app + DB)
bun turbo test:unit --filter=memory  # Tests for a single package
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (`postgres://dev:dev@localhost:5432/pihordev`) |
| `BETTER_AUTH_SECRET` | Auth secret key (random string) |
| `RESEND_API_KEY` | Resend email API key |
| `OPENAI_API_KEY` | OpenAI API key (for embeddings: `text-embedding-3-small`) |
| `OPENSANDBOX_URL` | OpenSandbox server URL (`http://localhost:8080`) |
| `ENCRYPTION_KEY` | ZenStack field encryption key (32-byte hex) |

---

## Production Roadmap

Features not implemented in MVP, planned for production:

| Feature | Technology | Purpose |
|---------|-----------|---------|
| Container orchestration | Kubernetes + OpenSandbox K8s runtime | Auto-scaling agent containers |
| High-throughput queue | BullMQ + Redis | Replace Sidequest.js for scale |
| Telemetry warehouse | ClickHouse | High-volume analytics storage |
| Caching layer | Redis | Dashboard cache, WS pub/sub, memory cache |
| SSO/SAML | better-auth plugins | Enterprise authentication |
| Push notifications | Browser Push API | Real-time alerts |
| Auto PR creation | GitHub App | Agents create PRs on completion |
| Budget alerts | Custom | Cost threshold notifications |

**Note on vector storage:** pgvectorscale with StreamingDiskANN handles production scale (28x lower p95 vs Pinecone s1 at 50M vectors). A dedicated vector DB (Qdrant/Pinecone) is not needed.

---

## License

[MIT](LICENSE)
