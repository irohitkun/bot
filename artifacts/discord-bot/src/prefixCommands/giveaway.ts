import { Message, EmbedBuilder, PermissionFlagsBits, TextChannel } from "discord.js";
import { PrefixCommand, parseDuration } from "./index.js";
import { db, giveawaysTable } from "../db/index.js";
import { and, eq } from "drizzle-orm";

async function pickWinners(messageId: string, channelId: string, count: number, client: any) {
  const channel = await client.channels.fetch(channelId).catch(() => null) as TextChannel | null;
  if (!channel) return [];
  const msg = await channel.messages.fetch(messageId).catch(() => null);
  if (!msg) return [];
  const reaction = msg.reactions.cache.get("🎉");
  if (!reaction) return [];
  const users = await reaction.users.fetch();
  const eligible = [...users.values()].filter((u) => !u.bot).sort(() => Math.random() - 0.5);
  return eligible.slice(0, Math.min(count, eligible.length)).map((u) => u.id);
}

export const command: PrefixCommand = {
  name: "giveaway",
  usage: "%giveaway <start|end|reroll> ...",
  description: "Manage giveaways",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) return void message.reply("❌ You need Manage Server permission.");
    const sub = args[0]?.toLowerCase();

    if (sub === "start") {
      const prize = args[1];
      const durationStr = args[2];
      const winnersCount = parseInt(args[3] ?? "1", 10);
      if (!prize || !durationStr) return void message.reply(`Usage: \`%giveaway start <prize> <duration> [winners]\``);
      const durationMs = parseDuration(durationStr);
      if (!durationMs) return void message.reply("Invalid duration. Use e.g. `10m`, `1h`, `7d`.");
      const endsAt = new Date(Date.now() + durationMs);
      const embed = new EmbedBuilder().setColor(0xf1c40f).setTitle("🎉 GIVEAWAY 🎉")
        .setDescription(`**Prize:** ${prize}\n\nReact with 🎉 to enter!\n\n**Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n**Winners:** ${winnersCount}`)
        .setFooter({ text: `Hosted by ${message.author.tag}` }).setTimestamp(endsAt);
      const msg = await message.channel.send({ embeds: [embed] });
      await msg.react("🎉");
      await db.insert(giveawaysTable).values({ guildId: message.guild!.id, channelId: message.channelId, messageId: msg.id, prize, winnersCount, hostId: message.author.id, hostTag: message.author.tag, endsAt });
      setTimeout(async () => {
        const winners = await pickWinners(msg.id, message.channelId, winnersCount, message.client);
        const winnerMentions = winners.map((id) => `<@${id}>`).join(", ") || "Nobody";
        const endEmbed = new EmbedBuilder().setColor(0x57f287).setTitle("🎉 Giveaway Ended").setDescription(`**Prize:** ${prize}\n**Winner(s):** ${winnerMentions}`).setTimestamp();
        await msg.edit({ embeds: [endEmbed] });
        await message.channel.send(`🎉 Congratulations ${winnerMentions}! You won **${prize}**!`);
      }, durationMs);
      return void message.reply(`✅ Giveaway started! Ends <t:${Math.floor(endsAt.getTime() / 1000)}:R>`);
    }

    if (sub === "end" || sub === "reroll") {
      const messageId = args[1];
      if (!messageId) return void message.reply(`Usage: \`%giveaway ${sub} <message_id>\``);
      const [giveaway] = await db.select().from(giveawaysTable).where(and(eq(giveawaysTable.guildId, message.guild!.id), eq(giveawaysTable.messageId, messageId)));
      if (!giveaway) return void message.reply("❌ Could not find that giveaway.");
      if (sub === "end" && giveaway.ended) return void message.reply("That giveaway has already ended.");
      const winners = await pickWinners(messageId, giveaway.channelId, giveaway.winnersCount, message.client);
      const winnerMentions = winners.map((id) => `<@${id}>`).join(", ") || "Nobody";
      if (sub === "end") {
        await db.insert(giveawaysTable).values({ ...giveaway, ended: true, winners: winners.join(",") }).onConflictDoUpdate({ target: giveawaysTable.messageId, set: { ended: true, winners: winners.join(",") } });
      }
      return void message.reply(`✅ ${sub === "reroll" ? "Rerolled!" : "Ended!"} Winner(s): ${winnerMentions}`);
    }

    return void message.reply(`Usage: \`${this.usage}\``);
  },
};
