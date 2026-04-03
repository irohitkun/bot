import {
  SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits,
  EmbedBuilder, TextChannel, ButtonBuilder, ButtonStyle, ActionRowBuilder,
} from "discord.js";
import { db, giveawaysTable } from "../db/index.js";
import { eq, and } from "drizzle-orm";

function parseDuration(input: string): number | null {
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const v = parseInt(match[1], 10);
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return v * multipliers[match[2].toLowerCase()];
}

export const data = new SlashCommandBuilder()
  .setName("giveaway")
  .setDescription("Manage giveaways")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((sub) =>
    sub.setName("start").setDescription("Start a giveaway")
      .addStringOption((o) => o.setName("prize").setDescription("What are you giving away?").setRequired(true))
      .addStringOption((o) => o.setName("duration").setDescription("Duration e.g. 10m, 1h, 7d").setRequired(true))
      .addIntegerOption((o) => o.setName("winners").setDescription("Number of winners (default 1)").setMinValue(1).setMaxValue(20).setRequired(false))
      .addChannelOption((o) => o.setName("channel").setDescription("Channel to post in (defaults to current)").setRequired(false))
  )
  .addSubcommand((sub) =>
    sub.setName("end").setDescription("End a giveaway early")
      .addStringOption((o) => o.setName("message_id").setDescription("Message ID of the giveaway").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("reroll").setDescription("Reroll winners for a finished giveaway")
      .addStringOption((o) => o.setName("message_id").setDescription("Message ID of the giveaway").setRequired(true))
  );

async function pickWinners(messageId: string, channelId: string, winnersCount: number, client: any): Promise<string[]> {
  const channel = await client.channels.fetch(channelId).catch(() => null) as TextChannel | null;
  if (!channel) return [];
  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (!message) return [];

  const reaction = message.reactions.cache.get("🎉");
  if (!reaction) return [];
  const users = await reaction.users.fetch();
  const eligible = [...users.values()].filter((u) => !u.bot);
  if (eligible.length === 0) return [];

  const shuffled = eligible.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(winnersCount, shuffled.length)).map((u) => u.id);
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guild!.id;

  if (sub === "start") {
    const prize = interaction.options.getString("prize", true);
    const durationStr = interaction.options.getString("duration", true);
    const winnersCount = interaction.options.getInteger("winners") ?? 1;
    const targetChannel = (interaction.options.getChannel("channel") ?? interaction.channel) as TextChannel;

    const durationMs = parseDuration(durationStr);
    if (!durationMs) return interaction.reply({ content: "Invalid duration. Use formats like `10m`, `1h`, `7d`.", flags: 64 });

    const endsAt = new Date(Date.now() + durationMs);

    const embed = new EmbedBuilder().setColor(0xf1c40f).setTitle("🎉 GIVEAWAY 🎉")
      .setDescription(`**Prize:** ${prize}\n\nReact with 🎉 to enter!\n\n**Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n**Winners:** ${winnersCount}`)
      .setFooter({ text: `Hosted by ${interaction.user.tag}` })
      .setTimestamp(endsAt);

    const msg = await targetChannel.send({ embeds: [embed] });
    await msg.react("🎉");

    await db.insert(giveawaysTable).values({
      guildId, channelId: targetChannel.id, messageId: msg.id,
      prize, winnersCount, hostId: interaction.user.id, hostTag: interaction.user.tag, endsAt,
    });

    setTimeout(async () => {
      const winners = await pickWinners(msg.id, targetChannel.id, winnersCount, interaction.client);
      const winnerMentions = winners.map((id) => `<@${id}>`).join(", ") || "Nobody (no entries)";

      const endEmbed = new EmbedBuilder().setColor(0x57f287).setTitle("🎉 Giveaway Ended")
        .setDescription(`**Prize:** ${prize}\n**Winner(s):** ${winnerMentions}`)
        .setFooter({ text: `Hosted by ${interaction.user.tag}` }).setTimestamp();

      await msg.edit({ embeds: [endEmbed] });
      await targetChannel.send(`🎉 Congratulations ${winnerMentions}! You won **${prize}**!`);

      await db.insert(giveawaysTable).values({ guildId, channelId: targetChannel.id, messageId: msg.id, prize, winnersCount, hostId: interaction.user.id, hostTag: interaction.user.tag, endsAt, ended: true, winners: winners.join(",") })
        .onConflictDoUpdate({ target: giveawaysTable.messageId, set: { ended: true, winners: winners.join(",") } });
    }, durationMs);

    return interaction.reply({ content: `✅ Giveaway started in ${targetChannel}! Ends <t:${Math.floor(endsAt.getTime() / 1000)}:R>`, flags: 64 });
  }

  if (sub === "end") {
    const messageId = interaction.options.getString("message_id", true).trim();
    const [giveaway] = await db.select().from(giveawaysTable).where(and(eq(giveawaysTable.guildId, guildId), eq(giveawaysTable.messageId, messageId)));
    if (!giveaway) return interaction.reply({ content: "Could not find that giveaway.", flags: 64 });
    if (giveaway.ended) return interaction.reply({ content: "That giveaway has already ended.", flags: 64 });

    const winners = await pickWinners(messageId, giveaway.channelId, giveaway.winnersCount, interaction.client);
    const winnerMentions = winners.map((id) => `<@${id}>`).join(", ") || "Nobody (no entries)";
    const channel = await interaction.client.channels.fetch(giveaway.channelId).catch(() => null) as TextChannel | null;
    if (channel) {
      const msg = await channel.messages.fetch(messageId).catch(() => null);
      if (msg) {
        const endEmbed = new EmbedBuilder().setColor(0x57f287).setTitle("🎉 Giveaway Ended")
          .setDescription(`**Prize:** ${giveaway.prize}\n**Winner(s):** ${winnerMentions}`)
          .setFooter({ text: `Hosted by ${giveaway.hostTag}` }).setTimestamp();
        await msg.edit({ embeds: [endEmbed] });
        await channel.send(`🎉 Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`);
      }
    }
    await db.insert(giveawaysTable).values({ ...giveaway, ended: true, winners: winners.join(",") })
      .onConflictDoUpdate({ target: giveawaysTable.messageId, set: { ended: true, winners: winners.join(",") } });
    return interaction.reply({ content: `✅ Giveaway ended. Winners: ${winnerMentions}`, flags: 64 });
  }

  if (sub === "reroll") {
    const messageId = interaction.options.getString("message_id", true).trim();
    const [giveaway] = await db.select().from(giveawaysTable).where(and(eq(giveawaysTable.guildId, guildId), eq(giveawaysTable.messageId, messageId)));
    if (!giveaway) return interaction.reply({ content: "Could not find that giveaway.", flags: 64 });
    if (!giveaway.ended) return interaction.reply({ content: "That giveaway hasn't ended yet. Use `/giveaway end` first.", flags: 64 });

    const winners = await pickWinners(messageId, giveaway.channelId, giveaway.winnersCount, interaction.client);
    const winnerMentions = winners.map((id) => `<@${id}>`).join(", ") || "Nobody";
    const channel = await interaction.client.channels.fetch(giveaway.channelId).catch(() => null) as TextChannel | null;
    if (channel) await channel.send(`🔁 **Giveaway Rerolled!** New winner(s): ${winnerMentions}! Congratulations on winning **${giveaway.prize}**!`);
    return interaction.reply({ content: `✅ Rerolled! New winners: ${winnerMentions}`, flags: 64 });
  }
}
