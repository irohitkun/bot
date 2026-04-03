import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, TextChannel } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("unlock")
  .setDescription("Unlock a channel so members can send messages again")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to unlock (defaults to current)").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetChannel = (interaction.options.getChannel("channel") ?? interaction.channel) as TextChannel;
  await targetChannel.permissionOverwrites.edit(interaction.guild!.roles.everyone, { SendMessages: null });
  const embed = new EmbedBuilder().setColor(0x57f287).setTitle("🔓 Channel Unlocked")
    .addFields({ name: "Channel", value: targetChannel.toString(), inline: true }, { name: "Moderator", value: interaction.user.tag, inline: true }).setTimestamp();
  await interaction.reply({ embeds: [embed] });
}
