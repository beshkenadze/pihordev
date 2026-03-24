# Testing Spec

## Tools

| Tool | Purpose |
|------|---------|
| Vitest | Unit + integration |
| Playwright | E2E |
| Testing Library | React components |
| testcontainers | PostgreSQL + pgvector in integration tests |
| Biome v2 | Lint + format check |
| GitHub Actions | CI/CD |

All local runs via `turbo test` with caching.

## Unit Tests

### packages/agent
- Sandbox tools proxy correctly (bash, read, write, edit)
- Handles timeout, non-zero exit
- Cost calculator: known models, unknown, zero tokens, cache pricing

### packages/memory
- Working memory: create, recall, schema validation, scope resource
- Semantic recall: store messages, recall by similarity, cross-thread
- Codebase RAG: index docs, chunk, GraphRAG query returns ranked results
- Pi extension: before_agent_start returns context, agent_end saves summary

### packages/analytics
- Time range queries, group by, percentiles, org scope, empty results

### packages/ws
- Routes steer/followUp/abort, broadcasts events, disconnect, rejects unauth

### packages/queue
- Job calls agentManager.startAgent, handles not found, retries

## Integration Tests

### packages/agent
- Full lifecycle: start → clone → tools → events → stop
- Multiple concurrent agents
- Completion/error updates task status

### packages/memory
- Full flow with real PostgreSQL + pgvectorscale
- Index codebase → working memory injected → semantic recall cross-thread → GraphRAG returns docs

### packages/auth
- Email signup → login → passkey enrollment → passkey login
- Invite → accept → member. Org switching.

### packages/db
- ACL: owner/admin/member. Cross-org isolation. Encrypted fields roundtrip.

### apps/web API
- Projects, tasks, agents, analytics endpoints. Auth required.

## E2E (Playwright)

- Login → overview dashboard → KPI cards
- Create project → create task → agent starts → chat
- Send steer → appears in chat
- Dashboard pages navigation
- Invite member, create API key

## Seed Data

Dashboard: 1 org, 3 teams, 8 users, 5 projects, 30 tasks, 30 days telemetry.
Memory: small repo with README + docs, pre-indexed.
Agent integration: small test repo + OpenSandbox via docker-compose.

## Coverage

Unit: > 80% on packages/. Integration: all endpoints + agent + memory. E2E: core paths.

## GitHub Actions CI/CD

### Workflows

#### `.github/workflows/ci.yml` — runs on every PR and push to main

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun biome check .

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun turbo build
      - run: bun turbo typecheck

  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun turbo build
      - run: bun turbo test:unit
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: unit-coverage
          path: packages/*/coverage/

  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: timescale/timescaledb-ha:pg16
        env:
          POSTGRES_DB: pihordev_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgres://test:test@localhost:5432/pihordev_test
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun turbo build
      - name: Run migrations
        run: bun turbo db:migrate
      - run: bun turbo test:integration

  test-e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [test-unit, test-integration]
    services:
      postgres:
        image: timescale/timescaledb-ha:pg16
        env:
          POSTGRES_DB: pihordev_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgres://test:test@localhost:5432/pihordev_test
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun turbo build
      - run: bun turbo db:migrate
      - run: bun turbo db:seed
      - uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('bun.lock') }}
      - run: bunx playwright install --with-deps chromium
      - run: bun turbo test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: e2e-results
          path: apps/web/test-results/
```

#### `.github/workflows/release.yml` — on tag push

```yaml
name: Release

on:
  push:
    tags: ["v*"]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun turbo build
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: docker/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.ref_name }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  agent-base:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: docker/agent-base
          push: true
          tags: ghcr.io/${{ github.repository }}/agent-base:${{ github.ref_name }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Turbo Remote Caching (optional)

```yaml
# In CI steps, enable Vercel Remote Cache for turbo
env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

### Branch Protection Rules

- Require CI to pass before merge
- Require at least 1 review on PRs
- No direct push to main
