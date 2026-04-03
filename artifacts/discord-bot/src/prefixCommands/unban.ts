import { Message, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { PrefixCommand } from "./index.js";

export const command: PrefixCommand = {
  name: "unban",
  usage: "%unban <user_id> [reason]",
  description: "Unban a user from the server",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) return void message.reply("❌ You need the Ban Members permission.");
    if (!args[0]) return void message.reply(`Usage: \`${this.usage}\``);
    const userId = args[0].trim();
    const reason = args.slice(1).join(" ") || "No reason provided";
    const ban = await message.guild!.bans.fetch(userId).catch(() => null);
    if (!ban) return void message.reply("This user is not banned or the ID is invalid.");
    await message.guild!.bans.remove(userId, reason);
    await message.reply(`✅ **${ban.user.tag}** has been unbanned.`);
  },
};
