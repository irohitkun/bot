import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, TextChannel } from "discord.js";
import { db, serverCustomizationTable } from "../db/index.js";
import { isPremiumGuild } from "../utils/permissions.js";
import { getGuildStyle, invalidateStyleCache } from "../utils/guildStyle.js";

export const data = new SlashCommandBuilder()
  .setName("welcome")
  .setDescription("Configure the welcome message for new members (Premium only)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((sub) =>
    sub.setName("set")
      .setDescription("Set the welcome channel and message")
      .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to send welcome messages in").setRequired(true))
      .addStringOption((opt) => opt.setName("message").setDescription("Welcome message. Use {user} for mention, {server} for server name, {count} for member count").setRequired(false))
  )
  .addSubcommand((sub) => sub.setName("test").setDescription("Preview the welcome message as if you just joined"))
  .addSubcommand((sub) => sub.setName("disable").setDescription("Disable welcome messages"));

function buildWelcomeMessage(template: string, member: { toString(): string; guild: { name: string; memberCount: number } }) {
  return template
    .replace(/\{user\}/gi, member.toString())
    .replace(/\{server\}/gi, member.guild.name)
    .replace(/\{count\}/gi, `${member.guild.memberCount}`);
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guild!.id;

  if (!(await isPremiumGuild(guildId))) {
    return interaction.reply({ content: "⭐ **Custom welcome messages are a Premium feature.** Contact the bot owner to upgrade.", flags: 64 });
  }

  const sub = interaction.options.getSubcommand();
  const style = await getGuildStyle(guildId);

  if (sub === "set") {
    const channel = interaction.options.getChannel("channel", true);
    const message = interaction.options.getString("message") ?? "👋 Welcome to **{server}**, {user}! You are member **#{count}**.";
    await db.insert(serverCustomizationTable)
      .values({ guildId, welcomeChannelId: channel.id, welcomeMessage: message })
      .onConflictDoUpdate({ target: serverCustomizationTable.guildId, set: { welcomeChannelId: channel.id, welcomeMessage: message, updatedAt: new Date() } });
    invalidateStyleCache(guildId);
    const embed = new EmbedBuilder().setColor(style.color)
      .setTitle("✅ Welcome Message Configured")
      .addFields(
        { name: "Channel", value: `<#${channel.id}>`, inline: true },
        { name: "Message Preview", value: message.replace(/\{user\}/gi, interaction.user.toString()).replace(/\{server\}/gi, interaction.guild!.name).replace(/\{count\}/gi, `${interaction.guild!.memberCount}`) }
      )
      .setFooter({ text: "Use /welcome test to preview it" }).setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "test") {
    const { getWelcomeConfig } = await import("../utils/guildStyle.js");
    const config = await getWelcomeConfig(guildId);
    if (!config.channelId) return interaction.reply({ content: "❌ No welcome channel configured. Use `/welcome set` first.", flags: 64 });
    const channel = interaction.guild!.channels.cache.get(config.channelId) as TextChannel | undefined;
    if (!channel) return interaction.reply({ content: "❌ Welcome channel not found.", flags: 64 });
    const msg = config.message ?? "👋 Welcome to **{server}**, {user}! You are member **#{count}**.";
    const built = buildWelcomeMessage(msg, interaction.member as any);
    const embed = new EmbedBuilder().setColor(style.color)
      .setTitle("👋 Welcome!")
      .setDescription(built)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter(style.footer ? { text: style.footer } : null).setTimestamp();
    await channel.send({ embeds: [embed] });
    return interaction.reply({ content: `✅ Test welcome message sent to ${channel}.`, flags: 64 });
  }

  if (sub === "disable") {
    await db.insert(serverCustomizationTable)
      .values({ guildId, welcomeChannelId: undefined })
      .onConflictDoUpdate({ target: serverCustomizationTable.guildId, set: { welcomeChannelId: undefined, welcomeMessage: undefined, updatedAt: new Date() } });
    invalidateStyleCache(guildId);
    return interaction.reply({ content: "✅ Welcome messages have been disabled.", flags: 64 });
  }
}
