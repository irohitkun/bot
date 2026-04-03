import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("role")
  .setDescription("Manage roles for members")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addSubcommand((sub) =>
    sub.setName("add").setDescription("Add a role to a member")
      .addUserOption((opt) => opt.setName("user").setDescription("Target member").setRequired(true))
      .addRoleOption((opt) => opt.setName("role").setDescription("Role to add").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("remove").setDescription("Remove a role from a member")
      .addUserOption((opt) => opt.setName("user").setDescription("Target member").setRequired(true))
      .addRoleOption((opt) => opt.setName("role").setDescription("Role to remove").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("info").setDescription("Get information about a role")
      .addRoleOption((opt) => opt.setName("role").setDescription("Role to inspect").setRequired(true))
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "info") {
    const role = interaction.options.getRole("role", true);
    const fullRole = await interaction.guild!.roles.fetch(role.id);
    if (!fullRole) return interaction.reply({ content: "Could not fetch that role.", flags: 64 });
    const embed = new EmbedBuilder().setColor(fullRole.color || 0x5865f2).setTitle(`🏷️ Role: ${fullRole.name}`)
      .addFields(
        { name: "Role ID", value: fullRole.id, inline: true },
        { name: "Color", value: fullRole.hexColor, inline: true },
        { name: "Position", value: `${fullRole.position}`, inline: true },
        { name: "Members", value: `${fullRole.members.size}`, inline: true },
        { name: "Mentionable", value: fullRole.mentionable ? "Yes" : "No", inline: true },
        { name: "Hoisted", value: fullRole.hoist ? "Yes" : "No", inline: true },
        { name: "Created", value: `<t:${Math.floor(fullRole.createdTimestamp / 1000)}:R>`, inline: true },
      ).setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  const target = interaction.options.getUser("user", true);
  const role = interaction.options.getRole("role", true);
  const member = await interaction.guild!.members.fetch(target.id).catch(() => null);
  if (!member) return interaction.reply({ content: "Could not find that member.", flags: 64 });

  const botMember = interaction.guild!.members.me!;
  if (role.position >= botMember.roles.highest.position) {
    return interaction.reply({ content: "❌ That role is higher than or equal to my highest role.", flags: 64 });
  }

  if (sub === "add") {
    if (member.roles.cache.has(role.id)) return interaction.reply({ content: `${target.tag} already has that role.`, flags: 64 });
    await member.roles.add(role.id, `Added by ${interaction.user.tag}`);
    const embed = new EmbedBuilder().setColor(0x57f287).setTitle("✅ Role Added")
      .addFields({ name: "User", value: `${target.tag}`, inline: true }, { name: "Role", value: `<@&${role.id}>`, inline: true }, { name: "By", value: interaction.user.tag, inline: true }).setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "remove") {
    if (!member.roles.cache.has(role.id)) return interaction.reply({ content: `${target.tag} doesn't have that role.`, flags: 64 });
    await member.roles.remove(role.id, `Removed by ${interaction.user.tag}`);
    const embed = new EmbedBuilder().setColor(0xed4245).setTitle("✅ Role Removed")
      .addFields({ name: "User", value: `${target.tag}`, inline: true }, { name: "Role", value: `<@&${role.id}>`, inline: true }, { name: "By", value: interaction.user.tag, inline: true }).setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }
}
