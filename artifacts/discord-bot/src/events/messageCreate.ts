import { Events, Message, EmbedBuilder } from "discord.js";
import { readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { PrefixCommand } from "../prefixCommands/index.js";
import { getPrefix, getNoPrefixMode } from "../utils/prefixCache.js";
import { db, afkUsersTable, automodSettingsTable } from "../db/index.js";
import { eq, and } from "drizzle-orm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prefixCommands = new Map<string, PrefixCommand>();
const spamTracker = new Map<string, number[]>();

async function loadPrefixCommands() {
  const dir = resolve(__dirname, "../prefixCommands");
  const files = readdirSync(dir).filter(
    (f) => (f.endsWith(".ts") || f.endsWith(".js")) && f !== "index.ts" && f !== "index.js"
  );
  for (const file of files) {
    const mod = await import(pathToFileURL(resolve(dir, file)).href);
    if (mod.command?.name) prefixCommands.set(mod.command.name, mod.command);
  }
  console.log(`Loaded ${prefixCommands.size} prefix commands.`);
}

loadPrefixCommands();

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message: Message) {
  if (message.author.bot) return;
  if (!message.guild) return;

  const guildId = message.guild.id;

  await handleAfkMentions(message, guildId);
  await clearAfkIfActive(message, guildId);
  await handleAutomod(message, guildId);

  const prefix = await getPrefix(guildId);
  const noPrefixMode = await getNoPrefixMode(guildId);

  const startsWithPrefix = message.content.startsWith(prefix);
  if (!startsWithPrefix && !noPrefixMode) return;

  const content = startsWithPrefix ? message.content.slice(prefix.length).trim() : message.content.trim();
  const args = content.split(/\s+/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  const command = prefixCommands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (err) {
    console.error(`Prefix command error [${commandName}]:`, err);
    await message.reply("❌ An error occurred while running that command.").catch(() => {});
  }
}

async function handleAfkMentions(message: Message, guildId: string) {
  if (message.mentions.users.size === 0) return;
  for (const [, user] of message.mentions.users) {
    const [afk] = await db
      .select()
      .from(afkUsersTable)
      .where(and(eq(afkUsersTable.userId, user.id), eq(afkUsersTable.guildId, guildId)));
    if (afk) {
      const since = `<t:${Math.floor(afk.setAt.getTime() / 1000)}:R>`;
      await message.reply(`💤 **${user.username}** is AFK ${since}\n> ${afk.reason}`).catch(() => {});
    }
  }
}

async function clearAfkIfActive(message: Message, guildId: string) {
  const [afk] = await db
    .select()
    .from(afkUsersTable)
    .where(and(eq(afkUsersTable.userId, message.author.id), eq(afkUsersTable.guildId, guildId)));
  if (!afk) return;
  await db.delete(afkUsersTable).where(
    and(eq(afkUsersTable.userId, message.author.id), eq(afkUsersTable.guildId, guildId))
  );
  await message.reply(`👋 Welcome back, **${message.author.username}**! Your AFK status has been removed.`).catch(() => {});
}

async function handleAutomod(message: Message, guildId: string) {
  const [settings] = await db.select().from(automodSettingsTable).where(eq(automodSettingsTable.guildId, guildId));
  if (!settings?.enabled) return;

  const content = message.content;
  const badWords = settings.badWords ? settings.badWords.split(",").map((w) => w.trim().toLowerCase()).filter(Boolean) : [];

  if (badWords.length > 0 && badWords.some((w) => content.toLowerCase().includes(w))) {
    await message.delete().catch(() => {});
    const warn = await message.channel.send(`⚠️ ${message.author}, your message was removed for containing a banned word.`);
    setTimeout(() => warn.delete().catch(() => {}), 5000);
    return;
  }

  if (settings.maxMentions > 0 && message.mentions.users.size + message.mentions.roles.size > settings.maxMentions) {
    await message.delete().catch(() => {});
    const warn = await message.channel.send(`⚠️ ${message.author}, too many mentions in one message.`);
    setTimeout(() => warn.delete().catch(() => {}), 5000);
    return;
  }

  if (content.length > 10 && settings.maxCapsPercent > 0) {
    const letters = content.replace(/[^a-zA-Z]/g, "");
    if (letters.length > 5) {
      const upper = content.replace(/[^A-Z]/g, "").length;
      const capsPercent = Math.round((upper / letters.length) * 100);
      if (capsPercent >= settings.maxCapsPercent) {
        await message.delete().catch(() => {});
        const warn = await message.channel.send(`⚠️ ${message.author}, please don't use excessive caps.`);
        setTimeout(() => warn.delete().catch(() => {}), 5000);
        return;
      }
    }
  }

  if (settings.antiSpamEnabled) {
    const key = `${guildId}:${message.author.id}`;
    const now = Date.now();
    const times = spamTracker.get(key) ?? [];
    const recent = times.filter((t) => now - t < 5000);
    recent.push(now);
    spamTracker.set(key, recent);
    if (recent.length >= 5) {
      await message.delete().catch(() => {});
      const warn = await message.channel.send(`⚠️ ${message.author}, slow down! You're sending messages too fast.`);
      setTimeout(() => warn.delete().catch(() => {}), 5000);
    }
  }
}
