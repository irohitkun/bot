import { Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from "./index.js";

export const command: PrefixCommand = {
  name: "serverinfo",
  usage: "%serverinfo",
  description: "View information about this server",
  async execute(message: Message) {
    const guild = await message.guild!.fetch();
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`🏠 ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }) ?? null)
      .addFields({ name: "ID", value: guild.id, inline: true }, { name: "Owner", value: `<@${guild.ownerId}>`, inline: true }, { name: "Members", value: `${guild.memberCount}`, inline: true }, { name: "Channels", value: `${guild.channels.cache.size}`, inline: true }, { name: "Roles", value: `${guild.roles.cache.size}`, inline: true }, { name: "Boost Level", value: `${guild.premiumTier}`, inline: true }).setTimestamp();
    await message.reply({ embeds: [embed] });
  },
};
