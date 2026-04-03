import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("banner")
  .setDescription("Display a user's profile banner")
  .addUserOption((opt) => opt.setName("user").setDescription("The user to get the banner of (defaults to you)").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("user") ?? interaction.user;
  const fullUser = await interaction.client.users.fetch(targetUser.id, { force: true });

  if (!fullUser.banner) {
    return interaction.reply({ content: `❌ **${fullUser.tag}** does not have a profile banner.`, flags: 64 });
  }

  const bannerUrl = fullUser.bannerURL({ size: 4096, extension: fullUser.banner.startsWith("a_") ? "gif" : "png" })!;
  const embed = new EmbedBuilder().setColor(fullUser.accentColor ?? 0x5865f2)
    .setTitle(`🎨 Banner — ${fullUser.tag}`)
    .setImage(bannerUrl)
    .setDescription(`[Download Banner](${bannerUrl})`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
