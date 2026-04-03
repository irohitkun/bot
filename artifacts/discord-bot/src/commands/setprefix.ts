import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { setPrefix, getPrefix } from "../utils/prefixCache.js";

export const data = new SlashCommandBuilder()
  .setName("setprefix")
  .setDescription("Change the bot's command prefix for this server")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((opt) => opt.setName("prefix").setDescription("New prefix (1-5 characters)").setRequired(true).setMinLength(1).setMaxLength(5));

export async function execute(interaction: ChatInputCommandInteraction) {
  const newPrefix = interaction.options.getString("prefix", true);
  await setPrefix(interaction.guild!.id, newPrefix);
  const embed = new EmbedBuilder().setColor(0x57f287).setTitle("✅ Prefix Updated")
    .addFields({ name: "New Prefix", value: `\`${newPrefix}\``, inline: true }, { name: "Set By", value: interaction.user.tag, inline: true })
    .setFooter({ text: `Example: ${newPrefix}help` }).setTimestamp();
  await interaction.reply({ embeds: [embed] });
}
