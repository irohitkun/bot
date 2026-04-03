import { Message, PermissionFlagsBits, TextChannel } from "discord.js";
import { PrefixCommand } from "./index.js";

export const command: PrefixCommand = {
  name: "unlock",
  usage: "%unlock",
  description: "Unlock the current channel",
  async execute(message: Message) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) return void message.reply("❌ You need the Manage Channels permission.");
    const channel = message.channel as TextChannel;
    await channel.permissionOverwrites.edit(message.guild!.roles.everyone, { SendMessages: null });
    await message.reply("🔓 Channel unlocked.");
  },
};
