import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, version as djsVersion } from "discord.js";
import { getGuildStyle } from "../utils/guildStyle.js";
import { isPremiumGuild } from "../utils/permissions.js";

export const data = new SlashCommandBuilder().setName("botinfo").setDescription("View information and stats about the bot");

export async function execute(interaction: ChatInputCommandInteraction) {
  const style = await getGuildStyle(interaction.guild!.id);
  const premium = await isPremiumGuild(interaction.guild!.id);
  const client = interaction.client;

  const uptime = process.uptime();
  const d = Math.floor(uptime / 86400);
  const h = Math.floor((uptime % 86400) / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const uptimeStr = [d > 0 ? `${d}d` : null, h > 0 ? `${h}h` : null, `${m}m`].filter(Boolean).join(" ");

  const memUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

  const embed = new EmbedBuilder()
    .setColor(style.color)
    .setTitle(`🤖 ${client.user!.tag}`)
    .setThumbnail(client.user!.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "Servers", value: `${client.guilds.cache.size}`, inline: true },
      { name: "Users", value: `${client.users.cache.size}`, inline: true },
      { name: "Commands", value: `${client.application?.commands.cache.size ?? "~30"}`, inline: true },
      { name: "Uptime", value: uptimeStr, inline: true },
      { name: "Ping", value: `${client.ws.ping}ms`, inline: true },
      { name: "Memory", value: `${memUsed} MB`, inline: true },
      { name: "Discord.js", value: `v${djsVersion}`, inline: true },
      { name: "Node.js", value: process.version, inline: true },
      { name: "This Server", value: premium ? "⭐ Premium" : "Free Tier", inline: true },
    )
    .setFooter({ text: style.footer ?? "Thank you for using this bot!" })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
