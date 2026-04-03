import { Message, PermissionFlagsBits } from "discord.js";
import { PrefixCommand, parseMention } from "./index.js";
import { db, warningsTable } from "../db/index.js";
import { eq, and, count } from "drizzle-orm";

export const command: PrefixCommand = {
  name: "clearwarn",
  usage: "%clearwarn @user",
  description: "Clear all warnings for a member",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) return void message.reply("❌ You need the Manage Server permission.");
    if (!args[0]) return void message.reply(`Usage: \`${this.usage}\``);
    const userId = parseMention(args[0]) ?? args[0];
    const [{ value: prev }] = await db.select({ value: count() }).from(warningsTable).where(and(eq(warningsTable.guildId, message.guild!.id), eq(warningsTable.userId, userId)));
    await db.delete(warningsTable).where(and(eq(warningsTable.guildId, message.guild!.id), eq(warningsTable.userId, userId)));
    await message.reply(`✅ Cleared **${prev}** warning(s).`);
  },
};
