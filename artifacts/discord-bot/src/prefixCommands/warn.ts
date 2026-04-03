import { Message, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { PrefixCommand, parseMention } from "./index.js";
import { db, warningsTable } from "../db/index.js";
import { eq, and, count } from "drizzle-orm";

export const command: PrefixCommand = {
  name: "warn",
  usage: "%warn @user <reason>",
  description: "Warn a member",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) return void message.reply("❌ You need the Moderate Members permission.");
    if (args.length < 2) return void message.reply(`Usage: \`${this.usage}\``);
    const userId = parseMention(args[0]) ?? args[0];
    const reason = args.slice(1).join(" ");
    const member = await message.guild!.members.fetch(userId).catch(() => null);
    if (!member) return void message.reply("❌ Could not find that member.");
    if (member.id === message.author.id) return void message.reply("❌ You cannot warn yourself.");
    await db.insert(warningsTable).values({ guildId: message.guild!.id, userId: member.user.id, userTag: member.user.tag, moderatorId: message.author.id, moderatorTag: message.author.tag, reason });
    const [{ value: total }] = await db.select({ value: count() }).from(warningsTable).where(and(eq(warningsTable.guildId, message.guild!.id), eq(warningsTable.userId, member.user.id)));
    try { await member.user.send(`⚠️ You have been warned in **${message.guild!.name}**.\n**Reason:** ${reason}\nTotal warnings: **${total}**`); } catch {}
    await message.reply(`✅ **${member.user.tag}** has been warned. They now have **${total}** warning(s).`);
  },
};
