# Implementation Plan

## Phase 1: Monorepo + OSS Foundation (day 1)

1. Create GitHub repo: `beshkenadze/pihordev` (public)
2. Init Bun workspace with apps/* + packages/*
3. Turborepo config (build/dev/test/typecheck/check caching)
4. Biome v2 config
5. tsconfig.base.json with path aliases
6. OSS files:
   - LICENSE (MIT)
   - CONTRIBUTING.md (setup, PR process, commit conventions)
   - README.md (project overview, architecture diagram, quick start)
   - .github/ISSUE_TEMPLATE/ (bug, feature request)
   - .github/PULL_REQUEST_TEMPLATE.md
   - CODE_OF_CONDUCT.md
7. GitHub Actions: `.github/workflows/ci.yml` (check, typecheck, test:unit)
8. Package skeletons: db, auth, agent, memory, queue, ws, analytics, email, shared
9. App skeletons: web (Next.js 15), agent-worker
10. Docker-compose: timescale/timescaledb-ha:pg16 + OpenSandbox
11. .github/workflows/release.yml (Docker build + push to ghcr.io on tag)
12. Verify: `turbo build` passes, CI green on first push

## Phase 2: Database + Auth (day 1-2)

13. packages/db: ZenStack v3 schema (all models), encryption plugin
14. `zen generate` + `zen migrate dev`
15. packages/auth: better-auth with org + passkey plugins
16. ZenStack + better-auth integration
17. packages/email: React Email templates + Resend
18. Email registration + verification flow
19. Passkey enrollment endpoint
20. Verify: signup → login → create org → invite (email sent)
21. Update CI: add integration test job with postgres service

## Phase 3: Memory Layer (day 2)

22. packages/memory: PostgresStore + PgVector setup
23. Working memory: Zod schema, create/recall per project
24. Semantic recall: embed messages, cross-thread search
25. Codebase indexer: collect docs → chunk → embed → PgVector (diskann index)
26. GraphRAG: create graph from codebase chunks, query tool
27. Pi extension: before_agent_start injects memory, agent_end saves learnings
28. Unit tests for all memory modules
29. Integration test: index → recall → verify context injection

## Phase 4: Agent Infrastructure (day 2-3)

30. Agent base Docker image (Node.js + git + pi-coding-agent)
31. packages/agent: sandbox tool proxying (bash/read/write/edit)
32. packages/agent: AgentManager with memory extension
33. packages/agent: TelemetryCollector
34. packages/shared: cost calculator + model pricing
35. packages/queue: Sidequest.js + AgentStartJob
36. Unit tests: sandbox tools, telemetry, cost
37. Integration test: enqueue → spawn → clone → index → execute → stop
38. Add agent-base Docker image to release workflow

## Phase 5: WebSocket + Chat UI (day 3)

39. packages/ws: gateway (upgrade, auth, routing)
40. Wire AgentSession events → WS broadcast
41. Wire WS messages → steer/followUp/abort
42. apps/web: shadcn/ui + AI elements
43. Agent chat component (messages, streaming, tool cards, input)
44. Agent list page (status, tokens, model)
45. Test: task → agent → connect WS → chat → steer

## Phase 6: Projects + Tasks (day 3-4)

46. Project CRUD + repo URL validation
47. Task CRUD + enqueue on create
48. Project pages: list, new, detail
49. Task pages: create, board view
50. Wire: create task → queued → agent spawns
51. Integration tests

## Phase 7: Dashboard (day 4)

52. packages/analytics: Kysely queries
53. Analytics API routes
54. Seed data generator (30 days)
55. Overview page: KPIs + Tremor charts
56. Usage & Cost page
57. Performance page
58. Errors page
59. Tools & Agents page

## Phase 8: Skills + Settings (day 4-5)

60. Platform skills: git-workflow, test-runner, code-review, project-setup
61. Platform AGENTS.md
62. Auth pages: login, signup, passkey enrollment
63. Org settings, members, teams
64. API key management
65. Invite flow (Resend)

## Phase 9: Polish + Testing + OSS (day 5-6)

66. Access control verification
67. Loading/empty/error states
68. Dark mode
69. Remaining integration tests
70. E2E tests: login → project → task → agent chat → dashboard
71. Add E2E job to CI workflow
72. README: architecture diagram (Mermaid), quick start, screenshots, env vars table
73. CONTRIBUTING: dev setup, testing, PR guidelines
74. System design diagram for interview
75. Document: implemented vs production
76. Git cleanup, tag v0.1.0, verify release workflow
