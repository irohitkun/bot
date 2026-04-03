# Discord Bot

A fully-featured Discord bot with moderation, utility, giveaways, AFK system, automod, and more.

## 🚀 Startup

**Startup file:** `index.ts` (8 characters — well within the 16-char limit)  
**Start command:** `tsx index.ts`

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DISCORD_BOT_TOKEN` | ✅ Yes | Your bot token from the Discord Developer Portal |
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `BOT_OWNERS` | ✅ Yes | Comma-separated Discord user IDs of bot owners/helpers (e.g. `123456,789012`) |
| `OPENAI_API_KEY` | Optional | For the `/translate` command |
| `PORT` | Optional | HTTP keep-alive server port (default: 3000) |

## ✅ Features

### All Tiers
| Command | Description |
|---|---|
| `/ban`, `/kick`, `/mute`, `/unmute`, `/unban` | Core moderation |
| `/warn`, `/warnings`, `/clearwarn` | Warning system |
| `/purge`, `/lock`, `/unlock`, `/slowmode` | Channel management |
| `/role add/remove/info` | Role management |
| `/userinfo`, `/serverinfo` | Info commands |
| `/avatar`, `/banner` | User avatar & banner |
| `/snipe` | Last deleted message |
| `/ping` | Bot latency |
| `/afk set/remove` | AFK status |
| `/giveaway start/end/reroll` | Giveaway system |
| `/translate` | AI-powered translation |
| `/invite` | Bot invite link |
| `/setprefix` | Change bot prefix |
| `/help` | Command list |

All commands also work with a prefix (default: `%`).

### ⭐ Premium Only
| Command | Description |
|---|---|
| `/automod` | Auto-moderation (bad words, caps, spam, mentions) |
| `/noprefix` | Bot responds without any prefix |

## 🔑 Bot Owner Commands (only you + helpers)

| Command | Description |
|---|---|
| `/premium activate <guild_id>` | Activate premium for a server |
| `/premium deactivate <guild_id>` | Remove premium from a server |
| `/premium status [guild_id]` | Check a server's premium status |
| `/premium list` | List all premium servers |

## 📋 Setup

1. Install dependencies: `npm install`
2. Set all environment variables (see table above)
3. Set `BOT_OWNERS` to your Discord user ID(s)
4. Start the bot: `tsx index.ts`
5. The bot auto-creates all database tables on first start

## 🗄️ Database

The bot automatically creates all required tables on startup. Just provide a `DATABASE_URL` PostgreSQL connection string.

Tables created:
- `guild_settings` — prefix and no-prefix mode per server
- `warnings` — warning records
- `premium_guilds` — which servers have premium
- `automod_settings` — automod config per server
- `giveaways` — active and ended giveaways
- `afk_users` — current AFK users

## 💬 No-Prefix Mode (Premium)

When enabled with `/noprefix enabled:true`, users can type commands without any prefix at all. Only available on premium servers.
