import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder().setName("invite").setDescription("Get the invite link to add the bot to your server");

export async function execute(interaction: ChatInputCommandInteraction) {
  const clientId = interaction.client.user.id;
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
  const embed = new EmbedBuilder().setColor(0x5865f2).setTitle("➕ Invite Me")
    .setDescription(`[Click here to add me to your server](${inviteUrl})`)
    .setFooter({ text: "Thank you for using this bot!" }).setTimestamp();
  await interaction.reply({ embeds: [embed] });
}
