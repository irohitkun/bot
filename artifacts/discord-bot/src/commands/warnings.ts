import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { warnings } from "./warn.js";

export const data = new SlashCommandBuilder()
  .setName("warnings")
  .setDescription("View warnings for a member")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user to check").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const guild = interaction.guild!;

  const key = `${guild.id}:${target.id}`;
  const userWarnings = warnings.get(key) ?? [];

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`⚠️ Warnings for ${target.tag}`)
    .setThumbnail(target.displayAvatarURL())
    .setTimestamp();

  if (userWarnings.length === 0) {
    embed.setDescription("This user has no warnings.");
  } else {
    embed.setDescription(`Total warnings: **${userWarnings.length}**`);
    for (let i = 0; i < userWarnings.length; i++) {
      const w = userWarnings[i];
      embed.addFields({
        name: `#${i + 1} — ${w.timestamp.toLocaleDateString()}`,
        value: `**Reason:** ${w.reason}\n**Moderator:** ${w.moderator}`,
      });
    }
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
