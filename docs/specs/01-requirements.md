# Requirements Spec: Pihordev — Agent Cloud Platform

## Product

Cloud platform for running autonomous AI coding agents on tasks in git repositories. Agents work in isolated sandboxes, users observe/interact via WebSocket chat. Analytics dashboard aggregates telemetry. Agents build project knowledge over time via semantic memory and codebase RAG.

Agent runtime: pi-coding-agent (pi.dev). Sandbox: Alibaba OpenSandbox. Memory: Mastra SDK. UI: Next.js + shadcn/ui + Tremor.

## Core Concepts

- **Project** = linked git repository with persistent memory (working memory + codebase index)
- **Task** = feature/bug in natural language, one agent per task
- **Agent** = pi-coding-agent in OpenSandbox, enriched with project memory before each turn
- **Session** = live WebSocket connection to running agent (chat)

## Users

| Persona | Needs | Views |
|---------|-------|-------|
| Org Admin | Spend, team comparison, adoption, errors | Org dashboard, projects |
| Team Lead | Team throughput, agents, cost per project | Team dashboard, task board |
| Developer | Create tasks, observe agents, intervene | Task creation, live chat |

## Core Flow

1. User creates project → links git repo
2. Platform indexes codebase (README, docs, architecture) into GraphRAG
3. User creates task → enters Sidequest.js queue
4. Worker spawns OpenSandbox → full clone → feature branch
5. Writes platform skills + AGENTS.md
6. Injects project memory: working memory + semantic recall from past tasks + codebase RAG context
7. Starts pi-coding-agent via SDK (server-side)
8. Agent works autonomously, events stream to server
9. On task completion: update working memory with learnings, index new code
10. User can connect/disconnect via WebSocket at any time
11. Telemetry feeds dashboard throughout

## Agent Architecture

Pi AgentSession on server. Tools proxied through OpenSandbox SDK. LLM calls direct. API keys never in sandbox.

### Memory (Mastra SDK)

Three layers of memory per project:

**Working Memory** — structured JSON scratchpad persisted across tasks. Contains: tech stack, conventions, team rules, deployment config. Agent updates it after each task via `updateWorkingMemory` tool. Stored in PostgreSQL via `@mastra/pg`.

**Semantic Recall** — RAG over past task conversations. When a new task starts, searches for relevant context from completed tasks in the same project. Cross-thread search scoped by project (resourceId = projectId). Uses PgVector.

**Codebase GraphRAG** — knowledge graph built from repo docs (README, ARCHITECTURE.md, key configs). Indexed on first clone, re-indexed on significant changes. Combines vector similarity with graph traversal for deeper context retrieval.

All three injected into agent context via pi extension `before_agent_start`.

### Providers

Via pi-ai: Anthropic, OpenAI, Google Gemini, GitHub Copilot, Z.AI/GLM, OpenRouter, Groq, Ollama.

### Sandbox (OpenSandbox)

One per task. Base image: Node.js + git + dev tools. Full clone. Egress allowed, ingress blocked. Configurable timeout. Killed on completion.

### Platform Skills

git-workflow, test-runner, code-review, dependency-mgmt, project-setup.

### Task Queue

Sidequest.js on PostgreSQL backend. Per-org concurrency limits. Retry with backoff. Built-in web dashboard.

## WebSocket Protocol

Server → Browser: `agent_event`, `agent_status`, `agent_attention`
Browser → Server: `steer`, `followUp`, `abort`, `set_model`

## Dashboard

Telemetry from AgentSession events. No OTel pipeline.

Pages: Overview, Usage & Cost, Performance, Errors, Tools & Agents, Live Agents.

## Auth

better-auth with organization plugin (teams enabled).

- Registration via email (React Email + Resend)
- Passkey enrollment in profile (optional, post-registration)
- Login via email or passkey
- Org invitation flow

Roles: owner, admin, member.

## Data Model

App tables (ZenStack v3, no Prisma): organization, team, user, member, project, task, agent_instance, api_key.

Telemetry tables: agent_event, daily_usage, daily_error_summary, daily_tool_usage.

Memory tables (Mastra PostgresStore + PgVector): threads, messages, embeddings, working_memory. Vector indexes via pgvectorscale StreamingDiskANN for production-grade filtered search.

Sensitive fields encrypted via ZenStack v3 encryption plugin.

## Out of Scope (prototype)

- Browser push notifications
- K8s orchestration / auto-scaling
- Auto PR creation
- Budget alerts
- SSO/SAML

## Open Source

License: MIT. Repository: github.com/beshkenadze/pihordev (public).

CI/CD: GitHub Actions. Lint/typecheck/unit on every PR, integration tests with PostgreSQL service, E2E with Playwright. Docker images published to ghcr.io on tag.

OSS artifacts: README with architecture diagram + quick start, CONTRIBUTING.md, issue/PR templates, CODE_OF_CONDUCT.md.
