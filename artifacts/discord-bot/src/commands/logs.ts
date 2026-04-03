import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { db, serverCustomizationTable } from "../db/index.js";
import { isPremiumGuild } from "../utils/permissions.js";
import { getGuildStyle, invalidateStyleCache } from "../utils/guildStyle.js";

export const data = new SlashCommandBuilder()
  .setName("logs")
  .setDescription("Set up a mod-log channel to track moderation actions (Premium only)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((sub) =>
    sub.setName("setchannel")
      .setDescription("Set the channel for moderation logs")
      .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to send logs to").setRequired(true))
  )
  .addSubcommand((sub) => sub.setName("disable").setDescription("Disable mod logging"))
  .addSubcommand((sub) => sub.setName("status").setDescription("View current log channel"));

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guild!.id;

  if (!(await isPremiumGuild(guildId))) {
    return interaction.reply({ content: "⭐ **Mod logging is a Premium feature.** Contact the bot owner to upgrade.", flags: 64 });
  }

  const sub = interaction.options.getSubcommand();
  const style = await getGuildStyle(guildId);

  if (sub === "setchannel") {
    const channel = interaction.options.getChannel("channel", true);
    await db.insert(serverCustomizationTable)
      .values({ guildId, logChannelId: channel.id })
      .onConflictDoUpdate({ target: serverCustomizationTable.guildId, set: { logChannelId: channel.id, updatedAt: new Date() } });
    invalidateStyleCache(guildId);
    const embed = new EmbedBuilder().setColor(style.color)
      .setTitle("✅ Mod Log Channel Set")
      .setDescription(`Moderation actions (bans, kicks, mutes, warns) will be logged in <#${channel.id}>.`)
      .setFooter(style.footer ? { text: style.footer } : null).setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "disable") {
    await db.insert(serverCustomizationTable)
      .values({ guildId })
      .onConflictDoUpdate({ target: serverCustomizationTable.guildId, set: { logChannelId: undefined, updatedAt: new Date() } });
    invalidateStyleCache(guildId);
    return interaction.reply({ content: "✅ Mod logging has been disabled.", flags: 64 });
  }

  if (sub === "status") {
    const { getLogChannel } = await import("../utils/guildStyle.js");
    const logChannel = await getLogChannel(guildId);
    const embed = new EmbedBuilder().setColor(style.color)
      .setTitle("📋 Mod Log Status")
      .addFields({ name: "Log Channel", value: logChannel ? `<#${logChannel}>` : "Not configured" })
      .setFooter(style.footer ? { text: style.footer } : null).setTimestamp();
    return interaction.reply({ embeds: [embed], flags: 64 });
  }
}
