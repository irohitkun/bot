import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getGuildStyle } from "../utils/guildStyle.js";

export const data = new SlashCommandBuilder()
  .setName("dice")
  .setDescription("Roll one or more dice")
  .addIntegerOption((opt) => opt.setName("sides").setDescription("Number of sides (default: 6)").setMinValue(2).setMaxValue(100).setRequired(false))
  .addIntegerOption((opt) => opt.setName("count").setDescription("Number of dice to roll (default: 1, max: 10)").setMinValue(1).setMaxValue(10).setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const sides = interaction.options.getInteger("sides") ?? 6;
  const count = interaction.options.getInteger("count") ?? 1;
  const style = await getGuildStyle(interaction.guild!.id);

  const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  const total = rolls.reduce((a, b) => a + b, 0);

  const embed = new EmbedBuilder()
    .setColor(style.color)
    .setTitle(`🎲 Dice Roll — ${count}d${sides}`)
    .setDescription(count === 1 ? `You rolled a **${total}**!` : `Rolls: **${rolls.join(", ")}**\nTotal: **${total}**`)
    .setFooter({ text: `Rolled by ${interaction.user.tag}${style.footer ? ` • ${style.footer}` : ""}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
