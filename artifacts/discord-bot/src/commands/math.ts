import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getGuildStyle } from "../utils/guildStyle.js";

function safeEval(expr: string): number | null {
  const clean = expr.replace(/[^0-9+\-*/.() %]/g, "");
  if (!clean) return null;
  try {
    const result = Function(`"use strict"; return (${clean})`)();
    if (typeof result !== "number" || !isFinite(result)) return null;
    return Math.round(result * 1e10) / 1e10;
  } catch {
    return null;
  }
}

export const data = new SlashCommandBuilder()
  .setName("math")
  .setDescription("Calculate a math expression")
  .addStringOption((opt) => opt.setName("expression").setDescription("e.g. (5 + 3) * 2 or 100 / 4").setRequired(true).setMaxLength(200));

export async function execute(interaction: ChatInputCommandInteraction) {
  const expr = interaction.options.getString("expression", true);
  const result = safeEval(expr);
  const style = await getGuildStyle(interaction.guild!.id);

  if (result === null) {
    return interaction.reply({ content: "❌ Invalid expression. Only numbers and `+ - * / ( ) .` are supported.", flags: 64 });
  }

  const embed = new EmbedBuilder()
    .setColor(style.color)
    .setTitle("🧮 Calculator")
    .addFields({ name: "Expression", value: `\`${expr}\``, inline: true }, { name: "Result", value: `**\`${result}\`**`, inline: true })
    .setFooter({ text: style.footer ?? `Calculated for ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
