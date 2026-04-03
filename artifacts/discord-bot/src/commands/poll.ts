import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getGuildStyle } from "../utils/guildStyle.js";

const EMOJIS = ["🇦", "🇧", "🇨", "🇩"];

export const data = new SlashCommandBuilder()
  .setName("poll")
  .setDescription("Create a poll with up to 4 options")
  .addStringOption((opt) => opt.setName("question").setDescription("The poll question").setRequired(true).setMaxLength(256))
  .addStringOption((opt) => opt.setName("option1").setDescription("First option").setRequired(true).setMaxLength(100))
  .addStringOption((opt) => opt.setName("option2").setDescription("Second option").setRequired(true).setMaxLength(100))
  .addStringOption((opt) => opt.setName("option3").setDescription("Third option (optional)").setRequired(false).setMaxLength(100))
  .addStringOption((opt) => opt.setName("option4").setDescription("Fourth option (optional)").setRequired(false).setMaxLength(100));

export async function execute(interaction: ChatInputCommandInteraction) {
  const question = interaction.options.getString("question", true);
  const options = [
    interaction.options.getString("option1", true),
    interaction.options.getString("option2", true),
    interaction.options.getString("option3"),
    interaction.options.getString("option4"),
  ].filter((o): o is string => o !== null);

  const style = await getGuildStyle(interaction.guild!.id);

  const embed = new EmbedBuilder()
    .setColor(style.color)
    .setTitle(`📊 ${question}`)
    .setDescription(options.map((opt, i) => `${EMOJIS[i]} ${opt}`).join("\n\n"))
    .setFooter({ text: `Poll by ${interaction.user.tag}${style.footer ? ` • ${style.footer}` : ""}` })
    .setTimestamp();

  const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
  for (let i = 0; i < options.length; i++) {
    await msg.react(EMOJIS[i]).catch(() => {});
  }
}
