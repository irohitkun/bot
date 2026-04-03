import { Message, EmbedBuilder } from "discord.js";
import { PrefixCommand, parseMention } from "./index.js";

export const command: PrefixCommand = {
  name: "userinfo",
  usage: "%userinfo [@user]",
  description: "Get information about a user",
  async execute(message: Message, args: string[]) {
    const userId = args[0] ? parseMention(args[0]) ?? args[0] : message.author.id;
    const user = await message.client.users.fetch(userId).catch(() => message.author);
    const member = await message.guild!.members.fetch(user.id).catch(() => null);
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields({ name: "ID", value: user.id, inline: true }, { name: "Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true });
    if (member) embed.addFields({ name: "Joined", value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : "Unknown", inline: true }, { name: "Nickname", value: member.nickname ?? "None", inline: true });
    await message.reply({ embeds: [embed] });
  },
};
