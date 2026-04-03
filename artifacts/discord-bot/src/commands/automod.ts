import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { db, automodSettingsTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { isBotOwner, isPremiumGuild } from "../utils/permissions.js";

export const data = new SlashCommandBuilder()
  .setName("automod")
  .setDescription("Configure automatic moderation (Premium feature)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((sub) => sub.setName("toggle").setDescription("Enable or disable automod").addBooleanOption((o) => o.setName("enabled").setDescription("Enable or disable").setRequired(true)))
  .addSubcommand((sub) => sub.setName("status").setDescription("View current automod settings"))
  .addSubcommand((sub) =>
    sub.setName("addword").setDescription("Add a banned word")
      .addStringOption((o) => o.setName("word").setDescription("Word to ban").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("removeword").setDescription("Remove a banned word")
      .addStringOption((o) => o.setName("word").setDescription("Word to remove").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("setmentions").setDescription("Set max mentions per message (0 = disabled)")
      .addIntegerOption((o) => o.setName("max").setDescription("Max mentions (0-20)").setMinValue(0).setMaxValue(20).setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("setcaps").setDescription("Set max caps % before removal (0 = disabled)")
      .addIntegerOption((o) => o.setName("percent").setDescription("Percentage (0-100)").setMinValue(0).setMaxValue(100).setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("antispam").setDescription("Toggle anti-spam (5 messages in 5s)")
      .addBooleanOption((o) => o.setName("enabled").setDescription("Enable or disable").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("logchannel").setDescription("Set a channel to log automod actions")
      .addChannelOption((o) => o.setName("channel").setDescription("Log channel").setRequired(true))
  );

async function getOrCreate(guildId: string) {
  const [existing] = await db.select().from(automodSettingsTable).where(eq(automodSettingsTable.guildId, guildId));
  if (existing) return existing;
  await db.insert(automodSettingsTable).values({ guildId });
  const [fresh] = await db.select().from(automodSettingsTable).where(eq(automodSettingsTable.guildId, guildId));
  return fresh;
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guild!.id;
  const userId = interaction.user.id;

  const premium = await isPremiumGuild(guildId);
  if (!premium && !isBotOwner(userId)) {
    return interaction.reply({ content: "❌ **Automod is a Premium feature.** Contact us to activate premium for your server.", flags: 64 });
  }

  const sub = interaction.options.getSubcommand();
  const settings = await getOrCreate(guildId);

  if (sub === "status") {
    const words = settings.badWords ? settings.badWords.split(",").filter(Boolean) : [];
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle("🛡️ Automod Settings")
      .addFields(
        { name: "Enabled", value: settings.enabled ? "✅ Yes" : "❌ No", inline: true },
        { name: "Anti-Spam", value: settings.antiSpamEnabled ? "✅ Yes" : "❌ No", inline: true },
        { name: "Max Mentions", value: settings.maxMentions === 0 ? "Disabled" : `${settings.maxMentions}`, inline: true },
        { name: "Max Caps %", value: settings.maxCapsPercent === 0 ? "Disabled" : `${settings.maxCapsPercent}%`, inline: true },
        { name: "Banned Words", value: words.length > 0 ? words.join(", ") : "None" },
        { name: "Log Channel", value: settings.logChannelId ? `<#${settings.logChannelId}>` : "Not set", inline: true },
      ).setTimestamp();
    return interaction.reply({ embeds: [embed], flags: 64 });
  }

  if (sub === "toggle") {
    const enabled = interaction.options.getBoolean("enabled", true);
    await db.insert(automodSettingsTable).values({ guildId, enabled }).onConflictDoUpdate({ target: automodSettingsTable.guildId, set: { enabled, updatedAt: new Date() } });
    return interaction.reply({ content: `✅ Automod is now **${enabled ? "enabled" : "disabled"}**.`, flags: 64 });
  }

  if (sub === "addword") {
    const word = interaction.options.getString("word", true).toLowerCase().trim();
    const words = settings.badWords ? settings.badWords.split(",").filter(Boolean) : [];
    if (words.includes(word)) return interaction.reply({ content: "That word is already banned.", flags: 64 });
    words.push(word);
    await db.insert(automodSettingsTable).values({ guildId, badWords: words.join(",") }).onConflictDoUpdate({ target: automodSettingsTable.guildId, set: { badWords: words.join(","), updatedAt: new Date() } });
    return interaction.reply({ content: `✅ Added \`${word}\` to the banned words list. (${words.length} total)`, flags: 64 });
  }

  if (sub === "removeword") {
    const word = interaction.options.getString("word", true).toLowerCase().trim();
    const words = settings.badWords ? settings.badWords.split(",").filter(Boolean) : [];
    const updated = words.filter((w) => w !== word);
    if (updated.length === words.length) return interaction.reply({ content: "That word is not in the banned list.", flags: 64 });
    await db.insert(automodSettingsTable).values({ guildId, badWords: updated.join(",") }).onConflictDoUpdate({ target: automodSettingsTable.guildId, set: { badWords: updated.join(","), updatedAt: new Date() } });
    return interaction.reply({ content: `✅ Removed \`${word}\` from the banned words list.`, flags: 64 });
  }

  if (sub === "setmentions") {
    const max = interaction.options.getInteger("max", true);
    await db.insert(automodSettingsTable).values({ guildId, maxMentions: max }).onConflictDoUpdate({ target: automodSettingsTable.guildId, set: { maxMentions: max, updatedAt: new Date() } });
    return interaction.reply({ content: `✅ Max mentions set to **${max === 0 ? "disabled" : max}**.`, flags: 64 });
  }

  if (sub === "setcaps") {
    const percent = interaction.options.getInteger("percent", true);
    await db.insert(automodSettingsTable).values({ guildId, maxCapsPercent: percent }).onConflictDoUpdate({ target: automodSettingsTable.guildId, set: { maxCapsPercent: percent, updatedAt: new Date() } });
    return interaction.reply({ content: `✅ Max caps set to **${percent === 0 ? "disabled" : `${percent}%`}**.`, flags: 64 });
  }

  if (sub === "antispam") {
    const enabled = interaction.options.getBoolean("enabled", true);
    await db.insert(automodSettingsTable).values({ guildId, antiSpamEnabled: enabled }).onConflictDoUpdate({ target: automodSettingsTable.guildId, set: { antiSpamEnabled: enabled, updatedAt: new Date() } });
    return interaction.reply({ content: `✅ Anti-spam is now **${enabled ? "enabled" : "disabled"}**.`, flags: 64 });
  }

  if (sub === "logchannel") {
    const channel = interaction.options.getChannel("channel", true);
    await db.insert(automodSettingsTable).values({ guildId, logChannelId: channel.id }).onConflictDoUpdate({ target: automodSettingsTable.guildId, set: { logChannelId: channel.id, updatedAt: new Date() } });
    return interaction.reply({ content: `✅ Automod log channel set to <#${channel.id}>.`, flags: 64 });
  }
}
