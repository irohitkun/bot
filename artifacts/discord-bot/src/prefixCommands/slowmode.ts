import { Message, PermissionFlagsBits, TextChannel } from "discord.js";
import { PrefixCommand } from "./index.js";

export const command: PrefixCommand = {
  name: "slowmode",
  usage: "%slowmode <seconds>",
  description: "Set slowmode for this channel (0 to disable)",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) return void message.reply("❌ You need the Manage Channels permission.");
    const seconds = parseInt(args[0], 10);
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) return void message.reply("Please provide a value between 0 and 21600.");
    await (message.channel as TextChannel).setRateLimitPerUser(seconds);
    await message.reply(`⏱️ Slowmode set to **${seconds === 0 ? "disabled" : `${seconds}s`}**.`);
  },
};
