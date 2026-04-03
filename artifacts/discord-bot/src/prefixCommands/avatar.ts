import { Message, EmbedBuilder } from "discord.js";
import { PrefixCommand, parseMention } from "./index.js";

export const command: PrefixCommand = {
  name: "avatar",
  usage: "%avatar [@user]",
  description: "Display a user's avatar",
  async execute(message: Message, args: string[]) {
    let target = message.author;
    if (args[0]) {
      const id = parseMention(args[0]) ?? args[0];
      target = await message.client.users.fetch(id).catch(() => message.author);
    }
    const member = await message.guild!.members.fetch(target.id).catch(() => null);
    const globalAvatar = target.displayAvatarURL({ size: 4096, extension: "png" });
    const serverAvatar = member?.displayAvatarURL({ size: 4096, extension: "png" });
    const embed = new EmbedBuilder().setColor(0x5865f2)
      .setTitle(`🖼️ Avatar — ${target.tag}`)
      .setImage(serverAvatar ?? globalAvatar)
      .setDescription([`[Global Avatar](${globalAvatar})`, serverAvatar && serverAvatar !== globalAvatar ? `[Server Avatar](${serverAvatar})` : null].filter(Boolean).join(" • "))
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
};
