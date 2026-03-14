import { Events, GuildMember, EmbedBuilder, TextChannel } from "discord.js";

export const name = Events.GuildMemberAdd;
export const once = false;

export async function execute(member: GuildMember) {
  if (!member.guild.systemChannelId) return;
  const guild = member.guild;
  const systemChannel = guild.channels.cache.get(guild.systemChannelId!) as TextChannel | undefined;
  if (!systemChannel) return;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Welcome!")
    .setDescription(
      `👋 Welcome to **${guild.name}**, ${member}! You are member **#${guild.memberCount}**.`
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  await systemChannel.send({ embeds: [embed] }).catch(() => {});
}
