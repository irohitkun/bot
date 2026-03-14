import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

const warnings = new Map<string, { reason: string; moderator: string; timestamp: Date }[]>();

export const data = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("Warn a member")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt.setName("user").setDescription("The user to warn").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("reason").setDescription("Reason for the warning").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason", true);

  const guild = interaction.guild!;
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!member) {
    return interaction.reply({ content: "Could not find that member in the server.", ephemeral: true });
  }

  if (member.id === interaction.user.id) {
    return interaction.reply({ content: "You cannot warn yourself.", ephemeral: true });
  }

  const key = `${guild.id}:${target.id}`;
  const userWarnings = warnings.get(key) ?? [];
  userWarnings.push({ reason, moderator: interaction.user.tag, timestamp: new Date() });
  warnings.set(key, userWarnings);

  try {
    await target.send(
      `⚠️ You have been warned in **${guild.name}** by ${interaction.user.tag}.\n**Reason:** ${reason}\nYou now have **${userWarnings.length}** warning(s).`
    );
  } catch {}

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setTitle("⚠️ Member Warned")
    .addFields(
      { name: "User", value: `${target.tag} (${target.id})`, inline: true },
      { name: "Moderator", value: interaction.user.tag, inline: true },
      { name: "Reason", value: reason },
      { name: "Total Warnings", value: `${userWarnings.length}`, inline: true }
    )
    .setThumbnail(target.displayAvatarURL())
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

export { warnings };
