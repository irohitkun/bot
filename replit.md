# Workspace

## Discord Bot (`artifacts/discord-bot/`)

A fully-featured Discord bot with moderation, giveaways, automod, AFK, snipe, and a paid-tier system.

### Startup
- **Startup file:** `index.ts` (8 chars — satisfies 16-char host limit)
- **Working directory:** `artifacts/discord-bot`
- **Start command:** `tsx index.ts`

### Required env vars
- `DISCORD_BOT_TOKEN` — bot token
- `DATABASE_URL` — PostgreSQL connection
- `BOT_OWNERS` — comma-separated owner/helper user IDs
- `OPENAI_API_KEY` — for translate command (optional)

### Feature tiers
- **Free:** Full moderation, role management, giveaways, AFK, avatar/banner, snipe, ping, translate
- **Premium (bot-owner activated):** Automod, No-Prefix Mode
- **Bot Owner only:** `/premium` commands (activate/deactivate/list)

---



## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
