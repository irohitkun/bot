import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, TextChannel } from "discord.js";
import { isPremiumGuild } from "../utils/permissions.js";
import { getGuildStyle, hexToInt } from "../utils/guildStyle.js";

export const data = new SlashCommandBuilder()
  .setName("embed")
  .setDescription("Send a custom embed message to a channel (Premium only)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption((opt) => opt.setName("title").setDescription("Embed title").setRequired(true).setMaxLength(256))
  .addStringOption((opt) => opt.setName("description").setDescription("Embed body text").setRequired(true).setMaxLength(2048))
  .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to send it in (defaults to current)").setRequired(false))
  .addStringOption((opt) => opt.setName("color").setDescription("Hex color override e.g. #ff5733 (defaults to your server color)").setRequired(false))
  .addStringOption((opt) => opt.setName("footer").setDescription("Custom footer text").setRequired(false).setMaxLength(100))
  .addStringOption((opt) => opt.setName("image").setDescription("Image URL to attach").setRequired(false))
  .addBooleanOption((opt) => opt.setName("timestamp").setDescription("Add timestamp to embed").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guild!.id;

  if (!(await isPremiumGuild(guildId))) {
    return interaction.reply({ content: "⭐ **Custom embeds are a Premium feature.** Contact the bot owner to upgrade.", flags: 64 });
  }

  const title = interaction.options.getString("title", true);
  const description = interaction.options.getString("description", true);
  const channel = (interaction.options.getChannel("channel") ?? interaction.channel) as TextChannel;
  const colorHex = interaction.options.getString("color");
  const footerText = interaction.options.getString("footer");
  const imageUrl = interaction.options.getString("image");
  const addTimestamp = interaction.options.getBoolean("timestamp") ?? false;

  const style = await getGuildStyle(guildId);
  const color = colorHex ? hexToInt(colorHex) ?? style.color : style.color;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description);

  if (footerText) embed.setFooter({ text: footerText });
  else if (style.footer) embed.setFooter({ text: style.footer });
  if (imageUrl) { try { embed.setImage(imageUrl); } catch {} }
  if (addTimestamp) embed.setTimestamp();

  await channel.send({ embeds: [embed] });
  await interaction.reply({ content: `✅ Embed sent to ${channel}.`, flags: 64 });
}
