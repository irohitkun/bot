import { Message, PermissionFlagsBits } from "discord.js";
import { PrefixCommand } from "./index.js";
import { setPrefix } from "../utils/prefixCache.js";

export const command: PrefixCommand = {
  name: "setprefix",
  usage: "%setprefix <prefix>",
  description: "Change the bot prefix for this server",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) return void message.reply("❌ You need the Manage Server permission.");
    if (!args[0] || args[0].length > 5) return void message.reply("Prefix must be 1-5 characters.");
    await setPrefix(message.guild!.id, args[0]);
    await message.reply(`✅ Prefix updated to \`${args[0]}\``);
  },
};
