import { Message, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { PrefixCommand, parseMention, parseDuration } from "./index.js";

export const command: PrefixCommand = {
  name: "mute",
  usage: "%mute @user <10m/1h/2d> [reason]",
  description: "Timeout a member",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) return void message.reply("❌ You need the Moderate Members permission.");
    if (args.length < 2) return void message.reply(`Usage: \`${this.usage}\``);
    const userId = parseMention(args[0]) ?? args[0];
    const durationMs = parseDuration(args[1]);
    if (!durationMs) return void message.reply("Invalid duration. Use e.g. `10m`, `1h`, `2d`.");
    const reason = args.slice(2).join(" ") || "No reason provided";
    const member = await message.guild!.members.fetch(userId).catch(() => null);
    if (!member) return void message.reply("❌ Could not find that member.");
    if (!member.moderatable) return void message.reply("❌ I cannot mute this user.");
    await member.timeout(durationMs, reason);
    const embed = new EmbedBuilder().setColor(0xfee75c).setTitle("🔇 Member Muted")
      .addFields({ name: "User", value: member.user.tag, inline: true }, { name: "Duration", value: args[1], inline: true }, { name: "Reason", value: reason }).setTimestamp();
    await message.reply({ embeds: [embed] });
  },
};
