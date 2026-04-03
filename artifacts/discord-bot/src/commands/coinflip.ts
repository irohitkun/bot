import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getGuildStyle } from "../utils/guildStyle.js";

export const data = new SlashCommandBuilder()
  .setName("coinflip")
  .setDescription("Flip a coin — heads or tails")
  .addStringOption((opt) => opt.setName("call").setDescription("Call it before the flip!").setRequired(false).addChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" }));

export async function execute(interaction: ChatInputCommandInteraction) {
  const call = interaction.options.getString("call");
  const result = Math.random() < 0.5 ? "heads" : "tails";
  const won = call ? call === result : null;
  const style = await getGuildStyle(interaction.guild!.id);

  const embed = new EmbedBuilder()
    .setColor(won === true ? 0x57f287 : won === false ? 0xed4245 : style.color)
    .setTitle(result === "heads" ? "🪙 Heads!" : "🪙 Tails!")
    .setDescription(
      call
        ? won
          ? `You called **${call}** — you were right! 🎉`
          : `You called **${call}** — you were wrong! 😬`
        : `The coin landed on **${result}**!`
    )
    .setFooter({ text: `Flipped by ${interaction.user.tag}${style.footer ? ` • ${style.footer}` : ""}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
