import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { warnings } from "./warn.js";

export const data = new SlashCommandBuilder()
  .setName("clearwarn")
  .setDescription("Clear all warnings for a member")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user to clear warnings for").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const guild = interaction.guild!;

  const key = `${guild.id}:${target.id}`;
  const prev = warnings.get(key)?.length ?? 0;
  warnings.delete(key);

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("✅ Warnings Cleared")
    .addFields(
      { name: "User", value: `${target.tag} (${target.id})`, inline: true },
      { name: "Moderator", value: interaction.user.tag, inline: true },
      { name: "Warnings Removed", value: `${prev}`, inline: true }
    )
    .setThumbnail(target.displayAvatarURL())
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
