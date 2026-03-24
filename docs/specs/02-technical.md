# Technical Implementation Spec

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Monorepo | Bun workspaces + Turborepo | Bun as PM and runtime; Turbo for build caching |
| Linting | Biome v2 | Replaces ESLint + Prettier |
| Frontend | Next.js 15 (App Router) | SSR, API routes, WebSocket |
| UI | shadcn/ui + AI elements | Chat/AI components |
| Charts | Tremor | Dashboard |
| Auth | better-auth (org + passkey) | Email reg, optional passkey |
| ORM / ACL | ZenStack v3 (no Prisma) | Kysely engine, better-auth integration |
| Encryption | ZenStack v3 encryption plugin | Sensitive fields at rest |
| Memory | @mastra/memory | Threads, semantic recall, working memory |
| RAG | @mastra/rag | MDocument, chunk, GraphRAG |
| Vectors | @mastra/pg (PgVector + PostgresStore) | PostgreSQL + pgvector + pgvectorscale |
| Database | PostgreSQL (pgvector + pgvectorscale) | App + telemetry + queue + vectors |
| Queue | Sidequest.js (PostgreSQL backend) | Task queue with dashboard |
| Agent | pi-coding-agent SDK | Multi-provider LLM, tools, skills |
| Sandbox | Alibaba OpenSandbox | Isolated containers |
| Email | React Email + Resend | Templates + delivery |
| WebSocket | ws | Real-time agent ↔ browser |
| Styling | Tailwind CSS v4 | Native to shadcn + Tremor |
| Validation | Zod | Runtime types |
| CI/CD | GitHub Actions | Lint, test, build, Docker publish |
| Registry | ghcr.io | Docker images for app + agent-base |
| License | MIT | Open source |

## Monorepo Structure

```
pihordev/
├── apps/
│   ├── web/                              # Next.js (dashboard + agent UI)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   └── invite/[id]/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx              # Overview
│   │   │   │   ├── usage/page.tsx
│   │   │   │   ├── performance/page.tsx
│   │   │   │   ├── errors/page.tsx
│   │   │   │   ├── tools/page.tsx
│   │   │   │   ├── agents/
│   │   │   │   │   ├── page.tsx          # Live agents
│   │   │   │   │   └── [taskId]/page.tsx # Agent chat
│   │   │   │   ├── projects/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   └── settings/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── members/page.tsx
│   │   │   │       ├── teams/page.tsx
│   │   │   │       └── api-keys/page.tsx
│   │   │   └── api/
│   │   │       ├── auth/[...all]/route.ts
│   │   │       └── v1/...
│   │   ├── components/
│   │   │   ├── ui/                       # shadcn
│   │   │   ├── ai/                       # shadcn AI elements
│   │   │   ├── charts/                   # Tremor
│   │   │   ├── dashboard/
│   │   │   ├── agent/
│   │   │   └── project/
│   │   └── package.json
│   │
│   └── agent-worker/                     # Sidequest worker process
│       ├── src/
│       │   ├── worker.ts
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── db/                               # ZenStack v3 schema + client
│   │   ├── schema/schema.zmodel
│   │   ├── src/
│   │   │   ├── client.ts                 # ZenStackClient
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── auth/                             # better-auth config
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── client.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── agent/                            # Agent manager + sandbox tools
│   │   ├── src/
│   │   │   ├── manager.ts
│   │   │   ├── sandbox-tools.ts
│   │   │   ├── telemetry.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── memory/                           # Mastra-based memory layer
│   │   ├── src/
│   │   │   ├── project-memory.ts         # Working memory per project
│   │   │   ├── semantic-recall.ts        # Cross-task semantic search
│   │   │   ├── codebase-rag.ts           # GraphRAG over repo docs
│   │   │   ├── indexer.ts                # Index repo on clone
│   │   │   ├── pi-extension.ts           # Pi before_agent_start hook
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── queue/                            # Sidequest.js config + jobs
│   │   ├── src/
│   │   │   ├── config.ts
│   │   │   ├── jobs/agent-start.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ws/                               # WebSocket gateway
│   │   ├── src/
│   │   │   ├── gateway.ts
│   │   │   ├── protocol.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── analytics/                        # Dashboard queries
│   │   ├── src/
│   │   │   ├── queries.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── email/                            # React Email + Resend
│   │   ├── src/
│   │   │   ├── templates/
│   │   │   ├── send.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── shared/                           # Types, utils, constants
│       ├── src/
│       │   ├── types.ts
│       │   ├── constants.ts              # Model pricing
│       │   └── index.ts
│       └── package.json
│
├── skills/                               # Platform skills
│   ├── git-workflow/SKILL.md
│   ├── test-runner/SKILL.md
│   ├── code-review/SKILL.md
│   ├── dependency-mgmt/SKILL.md
│   └── project-setup/SKILL.md
│
├── docker/
│   ├── docker-compose.yml
│   └── agent-base/Dockerfile
│
├── seed/
│   └── seed.ts
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                        # PR + push: lint, typecheck, test
│   │   └── release.yml                   # Tag: build + push Docker to ghcr.io
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.yml
│   │   └── feature.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── turbo.json
├── bunfig.toml
├── biome.json
├── package.json
├── tsconfig.base.json
├── LICENSE                               # MIT
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── README.md                             # Architecture, quick start, screenshots
```

## Mastra Memory Integration

### Dependencies (packages/memory)

```json
{
  "dependencies": {
    "@mastra/memory": "latest",
    "@mastra/rag": "latest",
    "@mastra/pg": "latest"
  }
}
```

### Project Working Memory

```typescript
// packages/memory/src/project-memory.ts
import { Memory } from '@mastra/memory';
import { PostgresStore, PgVector } from '@mastra/pg';

export function createProjectMemory() {
  return new Memory({
    storage: new PostgresStore({
      connectionString: process.env.DATABASE_URL!,
    }),
    vector: new PgVector(process.env.DATABASE_URL!),
    options: {
      lastMessages: 20,
      semanticRecall: {
        topK: 5,
        messageRange: 2,
        scope: 'resource',   // cross-thread: all tasks in same project
      },
      workingMemory: {
        enabled: true,
        schema: projectMemorySchema,  // Zod schema
        scope: 'resource',            // shared across all tasks in project
      },
    },
  });
}

// Working memory schema
const projectMemorySchema = z.object({
  techStack: z.string().optional(),
  conventions: z.string().optional(),
  deploymentConfig: z.string().optional(),
  teamRules: z.string().optional(),
  knownIssues: z.string().optional(),
  completedFeatures: z.array(z.string()).optional(),
});
```

### Codebase GraphRAG

```typescript
// packages/memory/src/codebase-rag.ts
import { MDocument, GraphRAG, createGraphRAGTool } from '@mastra/rag';
import { PgVector } from '@mastra/pg';
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function indexCodebase(repoPath: string, projectId: string) {
  const pgVector = new PgVector(process.env.DATABASE_URL!);
  
  // Collect indexable files: README, docs, configs
  const files = await collectIndexableFiles(repoPath);
  
  for (const file of files) {
    const doc = MDocument.fromText(file.content);
    const chunks = await doc.chunk({
      strategy: 'recursive',
      size: 512,
      overlap: 50,
    });
    
    const { embeddings } = await embedMany({
      values: chunks.map(c => c.text),
      model: openai.embedding('text-embedding-3-small'),
    });
    
    await pgVector.upsert(
      `codebase-${projectId}`,
      embeddings,
      chunks.map(c => ({ text: c.text, file: file.path })),
    );
  }
}

export function createCodebaseRAGTool(projectId: string) {
  return createGraphRAGTool({
    vectorStoreName: 'pgVector',
    indexName: `codebase-${projectId}`,
    model: openai.embedding('text-embedding-3-small'),
    graphOptions: { dimension: 1536, threshold: 0.7 },
    topK: 5,
  });
}
```

### Pi Extension for Memory Injection

```typescript
// packages/memory/src/pi-extension.ts
export function createMemoryExtension(projectId: string, memory: Memory) {
  return function(pi: ExtensionAPI) {
    pi.on('before_agent_start', async (event, ctx) => {
      // 1. Load working memory
      const workingMem = await memory.recall({
        threadId: `project-${projectId}`,
        resourceId: projectId,
      });
      
      // 2. Semantic recall from past tasks
      const relevantHistory = await memory.recall({
        threadId: `task-${ctx.taskId}`,
        resourceId: projectId,
        vectorSearchString: ctx.taskDescription,
        threadConfig: { semanticRecall: { topK: 5, scope: 'resource' } },
      });
      
      // 3. Inject into system prompt
      return {
        systemPromptAppend: `
## Project Knowledge
${workingMem.workingMemory || 'No project memory yet.'}

## Relevant Past Work
${relevantHistory.messages.map(m => m.content).join('\n---\n') || 'No relevant history.'}
        `,
      };
    });

    // After task completion: update working memory with learnings
    pi.on('agent_end', async (event, ctx) => {
      if (event.status === 'completed') {
        await memory.saveMessages({
          threadId: `task-${ctx.taskId}`,
          resourceId: projectId,
          messages: [{ role: 'system', content: `Task completed: ${ctx.taskTitle}. Summary: ${event.summary}` }],
        });
      }
    });
  };
}
```

## Agent Manager

```typescript
class AgentManager {
  private agents: Map<string, ManagedAgent>;

  async startAgent(task, project, org) {
    // 1. Create sandbox
    const sandbox = await Sandbox.create(baseImage, { env, timeout });
    
    // 2. Clone repo
    await sandbox.commands.run(`git clone ${project.repoUrl} /workspace`);
    await sandbox.commands.run(`cd /workspace && git checkout -b feature/task-${task.id}`);
    
    // 3. Write skills + AGENTS.md
    await sandbox.files.write_files([...platformSkills, agentsMd]);
    
    // 4. Index codebase if first task for this project
    await indexCodebaseIfNeeded(sandbox, project.id);
    
    // 5. Create memory-enriched pi session
    const memory = createProjectMemory();
    const memoryExtension = createMemoryExtension(project.id, memory);
    
    const { session } = await createAgentSession({
      model: resolveModel(org.defaultModel),
      tools: [
        sandboxBashTool(sandbox),
        sandboxReadTool(sandbox),
        sandboxWriteTool(sandbox),
        sandboxEditTool(sandbox),
      ],
      extensions: [memoryExtension],
      sessionManager: SessionManager.file(`/data/sessions/${task.id}`),
    });
    
    // 6. Subscribe to events
    session.subscribe(event => {
      this.telemetry.record(event);
      this.broadcast(task.id, event);
    });
    
    // 7. Start
    await session.prompt(task.description);
  }
}
```

## Docker Compose

```yaml
services:
  postgres:
    image: timescale/timescaledb-ha:pg16
    # Includes pgvector + pgvectorscale (StreamingDiskANN, SBQ)
    # pgvectorscale gives 28x lower p95 latency on large vector sets
    # Label-based filtered search for project-scoped embeddings
    environment:
      POSTGRES_DB: pihordev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

  opensandbox:
    image: opensandbox/server:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ports: ["8080:8080"]

volumes:
  pgdata:
```

Note: `timescale/timescaledb-ha:pg16` includes pgvector + pgvectorscale. pgvectorscale adds StreamingDiskANN index (disk-based, 28x lower p95 vs HNSW at scale) and label-based filtered search (efficient project-scoped embedding queries). Mastra PgVector works transparently — same operators, just `CREATE INDEX ... USING diskann` instead of `USING hnsw`.

## ZenStack v3 (no Prisma)

Kysely-based ORM. Schema-driven ACL. Encryption plugin for sensitive fields. Official better-auth integration. See v1 spec for schema details.

## System Design (production, not implemented)

- K8s with OpenSandbox K8s runtime
- BullMQ + Redis (replaces Sidequest)
- ClickHouse for telemetry
- Redis for dashboard cache + WS pub/sub + memory cache
- Dedicated vector DB (Qdrant/Pinecone) not needed — pgvectorscale with StreamingDiskANN handles production scale (28x lower p95 vs Pinecone s1 at 50M vectors)
- SSO/SAML via better-auth
- Browser Push API
- GitHub App for auto-PR
