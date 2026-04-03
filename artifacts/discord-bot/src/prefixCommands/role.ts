import { Message, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { PrefixCommand, parseMention } from "./index.js";

export const command: PrefixCommand = {
  name: "role",
  usage: "%role <add|remove|info> @user @role",
  description: "Manage roles for members",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return void message.reply("❌ You need the Manage Roles permission.");
    }
    const sub = args[0]?.toLowerCase();
    if (!sub || !["add", "remove", "info"].includes(sub)) return void message.reply(`Usage: \`${this.usage}\``);

    if (sub === "info") {
      const roleId = parseMention(args[1]) ?? args[1];
      if (!roleId) return void message.reply("Please mention a role.");
      const role = await message.guild!.roles.fetch(roleId).catch(() => null);
      if (!role) return void message.reply("❌ Could not find that role.");
      const embed = new EmbedBuilder().setColor(role.color || 0x5865f2).setTitle(`🏷️ ${role.name}`)
        .addFields({ name: "ID", value: role.id, inline: true }, { name: "Color", value: role.hexColor, inline: true }, { name: "Members", value: `${role.members.size}`, inline: true }, { name: "Position", value: `${role.position}`, inline: true }).setTimestamp();
      return void message.reply({ embeds: [embed] });
    }

    const userId = parseMention(args[1]) ?? args[1];
    const roleId = parseMention(args[2]) ?? args[2];
    if (!userId || !roleId) return void message.reply(`Usage: \`${this.usage}\``);

    const member = await message.guild!.members.fetch(userId).catch(() => null);
    const role = await message.guild!.roles.fetch(roleId).catch(() => null);
    if (!member) return void message.reply("❌ Could not find that member.");
    if (!role) return void message.reply("❌ Could not find that role.");

    const botMember = message.guild!.members.me!;
    if (role.position >= botMember.roles.highest.position) return void message.reply("❌ That role is higher than my highest role.");

    if (sub === "add") {
      await member.roles.add(role);
      const embed = new EmbedBuilder().setColor(0x57f287).setTitle("✅ Role Added")
        .addFields({ name: "User", value: member.user.tag, inline: true }, { name: "Role", value: role.name, inline: true }).setTimestamp();
      return void message.reply({ embeds: [embed] });
    }

    if (sub === "remove") {
      await member.roles.remove(role);
      const embed = new EmbedBuilder().setColor(0xed4245).setTitle("✅ Role Removed")
        .addFields({ name: "User", value: member.user.tag, inline: true }, { name: "Role", value: role.name, inline: true }).setTimestamp();
      return void message.reply({ embeds: [embed] });
    }
  },
};
