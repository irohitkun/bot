import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db, remindersTable } from "../db/index.js";
import { eq, and, lte, eq as eqAlias } from "drizzle-orm";
import { getGuildStyle } from "../utils/guildStyle.js";
import { client } from "../../../index.js";

function parseDuration(input: string): number | null {
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const v = parseInt(match[1], 10);
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return v * multipliers[match[2].toLowerCase()];
}

async function processReminders() {
  const due = await db.select().from(remindersTable)
    .where(and(eq(remindersTable.sent, false), lte(remindersTable.remindAt, new Date())));
  for (const r of due) {
    try {
      const channel = await client.channels.fetch(r.channelId).catch(() => null) as any;
      if (channel?.send) {
        const embed = new EmbedBuilder().setColor(0xfee75c).setTitle("⏰ Reminder!")
          .setDescription(`<@${r.userId}>, you asked to be reminded:\n\n**${r.message}**`)
          .setFooter({ text: `Set ${r.createdAt.toLocaleDateString()}` }).setTimestamp();
        await channel.send({ content: `<@${r.userId}>`, embeds: [embed] });
      }
      await db.delete(remindersTable).where(eq(remindersTable.id, r.id));
    } catch (e) {
      console.error("Reminder send error:", e);
    }
  }
}

setInterval(processReminders, 30_000);

export const data = new SlashCommandBuilder()
  .setName("remind")
  .setDescription("Set a reminder — I'll ping you when time is up")
  .addStringOption((opt) => opt.setName("time").setDescription("When to remind you e.g. 30m, 2h, 1d").setRequired(true))
  .addStringOption((opt) => opt.setName("message").setDescription("What to remind you about").setRequired(true).setMaxLength(300));

export async function execute(interaction: ChatInputCommandInteraction) {
  const timeStr = interaction.options.getString("time", true);
  const message = interaction.options.getString("message", true);
  const durationMs = parseDuration(timeStr);
  if (!durationMs || durationMs < 10000) return interaction.reply({ content: "❌ Invalid time. Use e.g. `30m`, `2h`, `1d`. Minimum is 10 seconds.", flags: 64 });
  if (durationMs > 30 * 24 * 60 * 60 * 1000) return interaction.reply({ content: "❌ Maximum reminder time is 30 days.", flags: 64 });

  const remindAt = new Date(Date.now() + durationMs);
  await db.insert(remindersTable).values({ userId: interaction.user.id, channelId: interaction.channelId, message, remindAt });

  const style = await getGuildStyle(interaction.guild!.id);
  const embed = new EmbedBuilder().setColor(style.color).setTitle("⏰ Reminder Set!")
    .addFields({ name: "Message", value: message }, { name: "Remind At", value: `<t:${Math.floor(remindAt.getTime() / 1000)}:F> (<t:${Math.floor(remindAt.getTime() / 1000)}:R>)` })
    .setFooter({ text: style.footer ?? `I'll ping you in this channel` }).setTimestamp();
  await interaction.reply({ embeds: [embed], flags: 64 });
}
