import { Message, PermissionFlagsBits, TextChannel } from "discord.js";
import { PrefixCommand, parseMention } from "./index.js";

export const command: PrefixCommand = {
  name: "purge",
  usage: "%purge <1-100> [@user]",
  description: "Bulk delete messages",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) return void message.reply("❌ You need the Manage Messages permission.");
    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount < 1 || amount > 100) return void message.reply("Please provide a number between 1 and 100.");
    const filterUserId = args[1] ? parseMention(args[1]) ?? args[1] : null;
    const channel = message.channel as TextChannel;
    const fetched = await channel.messages.fetch({ limit: amount + 1 });
    let toDelete = [...fetched.values()].filter((m) => Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
    if (filterUserId) toDelete = toDelete.filter((m) => m.author.id === filterUserId);
    if (toDelete.length === 0) return void message.reply("No eligible messages.");
    const deleted = await channel.bulkDelete(toDelete, true);
    const reply = await message.channel.send(`✅ Deleted **${deleted.size}** message(s).`);
    setTimeout(() => reply.delete().catch(() => {}), 3000);
  },
};
