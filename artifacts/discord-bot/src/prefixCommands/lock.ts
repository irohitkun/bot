import { Message, PermissionFlagsBits, TextChannel } from "discord.js";
import { PrefixCommand } from "./index.js";

export const command: PrefixCommand = {
  name: "lock",
  usage: "%lock [reason]",
  description: "Lock the current channel",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) return void message.reply("❌ You need the Manage Channels permission.");
    const reason = args.join(" ") || "Channel locked";
    const channel = message.channel as TextChannel;
    await channel.permissionOverwrites.edit(message.guild!.roles.everyone, { SendMessages: false });
    await message.reply(`🔒 Channel locked. Reason: ${reason}`);
  },
};
