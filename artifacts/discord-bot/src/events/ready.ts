import { Client, Events, ActivityType } from "discord.js";
import { registerSlashCommands } from "../utils/registerCommands.js";
import { db, guildSettingsTable, warningsTable, premiumGuildsTable, automodSettingsTable, giveawaysTable, afkUsersTable } from "../db/index.js";
import { sql } from "drizzle-orm";

export const name = Events.ClientReady;
export const once = true;

async function ensureTables() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      prefix TEXT NOT NULL DEFAULT '%',
      no_prefix_mode BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS warnings (
      id SERIAL PRIMARY KEY,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_tag TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      moderator_tag TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS premium_guilds (
      guild_id TEXT PRIMARY KEY,
      activated_by TEXT NOT NULL,
      activated_by_tag TEXT NOT NULL,
      activated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMP,
      tier TEXT NOT NULL DEFAULT 'basic',
      notes TEXT
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS automod_settings (
      guild_id TEXT PRIMARY KEY,
      enabled BOOLEAN NOT NULL DEFAULT FALSE,
      bad_words TEXT NOT NULL DEFAULT '',
      max_mentions INTEGER NOT NULL DEFAULT 5,
      max_caps_percent INTEGER NOT NULL DEFAULT 70,
      log_channel_id TEXT,
      anti_spam_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS giveaways (
      id SERIAL PRIMARY KEY,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      prize TEXT NOT NULL,
      winners_count INTEGER NOT NULL DEFAULT 1,
      host_id TEXT NOT NULL,
      host_tag TEXT NOT NULL,
      ends_at TIMESTAMP NOT NULL,
      ended BOOLEAN NOT NULL DEFAULT FALSE,
      winners TEXT NOT NULL DEFAULT ''
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS afk_users (
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT 'AFK',
      set_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, guild_id)
    )
  `);
}

export async function execute(client: Client) {
  console.log(`Logged in as ${client.user?.tag}`);
  client.user?.setActivity("servers 🛡️ | /help", { type: ActivityType.Watching });

  try {
    await ensureTables();
    console.log("Database tables ready.");
  } catch (err) {
    console.error("Failed to create tables:", err);
  }

  try {
    await registerSlashCommands(process.env.DISCORD_BOT_TOKEN!, client.user!.id);
  } catch (err) {
    console.error("Failed to register slash commands:", err);
  }
}
