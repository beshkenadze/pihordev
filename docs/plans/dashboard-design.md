# Dashboard Design — Standalone Analytics Dashboard

## Overview

Standalone Next.js 16 dashboard with mocked data for the pihordev agent cloud platform.
Branch: `dashboard` (off `main`). No monorepo — single app.

## Pages

1. **Overview** — KPI cards (sparklines), daily tasks bar chart, cost trend, recent tasks table
2. **Usage & Cost** — cost by model/project/team, token usage over time, task volume by project
3. **Performance** — p50/p95 latency, success rate, completion time distribution, model comparison
4. **Errors** — error rate, errors by type/project, error log table
5. **Tools & Agents** — tool usage, tool success rate, model distribution, tokens per task
6. **Live Agents** — mocked running agents (cards with status, model, elapsed time)

## Stack

Next.js 16, shadcn/ui, Tremor, Tailwind CSS v4, Geist font, next-themes (dark/light toggle), Biome v2.

## Mock Data

30 days, 1 org, 3 teams, 8 users, 5 projects, 30 tasks. Realistic distributions.
All from `lib/mock-data.ts`. No API routes or DB.
