# EVO Command Center

> AI-powered B2B intelligence platform for project analysis, market signals, and client-ready reporting.

## What This Is

EVO Command Center is a structured intelligence platform that helps business development teams evaluate B2B opportunities, analyze project portfolios, and produce professional client reports.

## How It Works

1. **Search & Filter** — find projects by name, country, niche, or stage
2. **Analyze** — run 5 specialized agents (geo, niche, competitor, pricing, margin) that independently evaluate each project
3. **Score & Synthesize** — agents produce composite scores and a synthesis recommendation
4. **Export** — generate client-ready reports at Minimal, Standard, or Premium tiers

## Subscription Tiers

| Tier | Price | Projects | Analyses/mo | Reports/mo |
|------|-------|----------|-------------|------------|
| Minimal | $49/mo | 5 | 10 | 5 |
| Standard | $149/mo | 25 | 50 | 25 |
| Premium | $399/mo | 100 | 200 | 100 |

## Tech Stack

- Next.js (App Router) + TypeScript
- SQLite (better-sqlite3)
- Zustand (client state)
- Tailwind CSS
- Deployed on Render

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EVO_OWNER_TOKEN` | Yes (production) | Owner access token for audit/history endpoints |

---

## Freeze Status — 2026-07-20

**EVO is paused in a clean, production-ready state.**

### What is live and working
- Email authentication (login, session, logout)
- 3-tier subscription system (Minimal / Standard / Premium)
- Server-side analysis pipeline (5 agents + synthesis)
- Client-ready report generation (Minimal / Standard / Premium + presentation deck)
- Owner-protected audit and history endpoints
- 4-locale support (EN, RU, DE, TR)
- Dashboard with real data (projects, signals, agent summary, plan status)

### What is intentionally hidden
- Google OAuth — requires OAuth credentials to activate
- GitHub OAuth — requires OAuth App credentials to activate
- Web3 wallet — requires provider library to activate
- Owner panel Health/Audit tabs — behind owner token authentication

### Known limitations
- Analysis runs on the server synchronously (no async queue)
- SQLite is single-instance (no horizontal scaling)
- History stored server-side with 200-row retention
- No CI/CD pipeline (deployed via git push to Render)

### When resuming EVO
1. If adding OAuth providers: configure credentials in Render env vars, re-enable buttons in `evo-auth.tsx`
2. If adding new councils: follow `standards/acceptance-gates.md`
3. If expanding services: follow `templates/template-service-package.md`
4. Always verify on Render after pushing to `master`
