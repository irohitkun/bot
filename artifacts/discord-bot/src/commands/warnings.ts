import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { db, warningsTable } from "../db/index.js";
import { eq, and, asc } from "drizzle-orm";

export const data = new SlashCommandBuilder()
  .setName("warnings")
  .setDescription("View warnings for a member")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) => opt.setName("user").setDescription("The user to check").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const rows = await db.select().from(warningsTable).where(and(eq(warningsTable.guildId, interaction.guild!.id), eq(warningsTable.userId, target.id))).orderBy(asc(warningsTable.createdAt));
  const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`⚠️ Warnings for ${target.tag}`).setThumbnail(target.displayAvatarURL()).setTimestamp();
  if (rows.length === 0) { embed.setDescription("This user has no warnings."); }
  else {
    embed.setDescription(`Total warnings: **${rows.length}**`);
    rows.slice(0, 10).forEach((w, i) => embed.addFields({ name: `#${i + 1} — ${w.createdAt.toLocaleDateString()}`, value: `**Reason:** ${w.reason}\n**Moderator:** ${w.moderatorTag}` }));
  }
  await interaction.reply({ embeds: [embed], flags: 64 });
}
