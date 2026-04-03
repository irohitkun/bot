import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("avatar")
  .setDescription("Display a user's avatar")
  .addUserOption((opt) => opt.setName("user").setDescription("The user to get the avatar of (defaults to you)").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user") ?? interaction.user;
  const member = await interaction.guild!.members.fetch(target.id).catch(() => null);

  const globalAvatar = target.displayAvatarURL({ size: 4096, extension: "png" });
  const serverAvatar = member?.displayAvatarURL({ size: 4096, extension: "png" });

  const embed = new EmbedBuilder().setColor(0x5865f2)
    .setTitle(`🖼️ Avatar — ${target.tag}`)
    .setImage(serverAvatar ?? globalAvatar)
    .setTimestamp();

  const links: string[] = [`[Global Avatar](${globalAvatar})`];
  if (serverAvatar && serverAvatar !== globalAvatar) links.push(`[Server Avatar](${serverAvatar})`);
  embed.setDescription(links.join(" • "));

  if (target.banner) {
    const bannerUrl = target.bannerURL({ size: 4096, extension: "png" })!;
    embed.addFields({ name: "Banner", value: `[View Banner](${bannerUrl})` });
  }

  await interaction.reply({ embeds: [embed] });
}
