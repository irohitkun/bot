import { Message, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { PrefixCommand, parseMention } from "./index.js";

export const command: PrefixCommand = {
  name: "unmute",
  usage: "%unmute @user",
  description: "Remove a timeout from a member",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) return void message.reply("❌ You need the Moderate Members permission.");
    if (!args[0]) return void message.reply(`Usage: \`${this.usage}\``);
    const userId = parseMention(args[0]) ?? args[0];
    const member = await message.guild!.members.fetch(userId).catch(() => null);
    if (!member) return void message.reply("❌ Could not find that member.");
    if (!member.isCommunicationDisabled()) return void message.reply("This user is not muted.");
    await member.timeout(null);
    await message.reply(`✅ ${member.user.tag} has been unmuted.`);
  },
};
