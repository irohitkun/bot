import { Message, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { PrefixCommand, parseMention } from "./index.js";
import { db, warningsTable } from "../db/index.js";
import { eq, and, asc } from "drizzle-orm";

export const command: PrefixCommand = {
  name: "warnings",
  usage: "%warnings @user",
  description: "View warnings for a member",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) return void message.reply("❌ You need the Moderate Members permission.");
    if (!args[0]) return void message.reply(`Usage: \`${this.usage}\``);
    const userId = parseMention(args[0]) ?? args[0];
    const user = await message.client.users.fetch(userId).catch(() => null);
    if (!user) return void message.reply("❌ Could not find that user.");
    const rows = await db.select().from(warningsTable).where(and(eq(warningsTable.guildId, message.guild!.id), eq(warningsTable.userId, userId))).orderBy(asc(warningsTable.createdAt));
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`⚠️ Warnings for ${user.tag}`);
    if (rows.length === 0) embed.setDescription("No warnings.");
    else { embed.setDescription(`Total: **${rows.length}**`); rows.slice(0, 10).forEach((w, i) => embed.addFields({ name: `#${i + 1} — ${w.createdAt.toLocaleDateString()}`, value: `**Reason:** ${w.reason}\n**By:** ${w.moderatorTag}` })); }
    await message.reply({ embeds: [embed] });
  },
};
