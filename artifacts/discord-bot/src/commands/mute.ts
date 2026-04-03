import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";

function parseDuration(input: string): number | null {
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const v = parseInt(match[1], 10);
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return v * multipliers[match[2].toLowerCase()];
}

export const data = new SlashCommandBuilder()
  .setName("mute")
  .setDescription("Timeout (mute) a member")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) => opt.setName("user").setDescription("The user to mute").setRequired(true))
  .addStringOption((opt) => opt.setName("duration").setDescription("Duration e.g. 10m, 1h, 2d (max 28d)").setRequired(true))
  .addStringOption((opt) => opt.setName("reason").setDescription("Reason for the mute").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const durationInput = interaction.options.getString("duration", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const durationMs = parseDuration(durationInput);
  if (!durationMs) return interaction.reply({ content: "Invalid duration. Use formats like `10m`, `1h`, `2d`.", flags: 64 });
  const maxMs = 28 * 24 * 60 * 60 * 1000;
  if (durationMs > maxMs) return interaction.reply({ content: "Max timeout is 28 days.", flags: 64 });
  const member = await interaction.guild!.members.fetch(target.id).catch(() => null);
  if (!member) return interaction.reply({ content: "Could not find that member.", flags: 64 });
  if (!member.moderatable) return interaction.reply({ content: "I cannot mute this user.", flags: 64 });
  if (member.id === interaction.user.id) return interaction.reply({ content: "You cannot mute yourself.", flags: 64 });
  await member.timeout(durationMs, reason);
  const embed = new EmbedBuilder().setColor(0xfee75c).setTitle("🔇 Member Muted")
    .addFields({ name: "User", value: `${target.tag} (${target.id})`, inline: true }, { name: "Duration", value: durationInput, inline: true }, { name: "Reason", value: reason }, { name: "Moderator", value: interaction.user.tag, inline: true })
    .setThumbnail(target.displayAvatarURL()).setTimestamp();
  await interaction.reply({ embeds: [embed] });
}
