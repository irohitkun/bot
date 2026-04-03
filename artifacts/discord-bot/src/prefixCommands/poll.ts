import { Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from "./index.js";
import { getGuildStyle } from "../utils/guildStyle.js";

const EMOJIS = ["🇦", "🇧", "🇨", "🇩"];

export const command: PrefixCommand = {
  name: "poll",
  usage: '%poll "Question" "Option A" "Option B" ["Option C"]',
  description: "Create a poll with 2–4 options",
  async execute(message: Message, args: string[]) {
    const matches = message.content.match(/"([^"]+)"/g);
    if (!matches || matches.length < 3) return void message.reply('Usage: `%poll "Question" "Option A" "Option B" ["Option C"]`');
    const [question, ...options] = matches.map((m) => m.slice(1, -1));
    const style = await getGuildStyle(message.guild!.id);
    const embed = new EmbedBuilder().setColor(style.color)
      .setTitle(`📊 ${question}`)
      .setDescription(options.map((opt, i) => `${EMOJIS[i]} ${opt}`).join("\n\n"))
      .setFooter({ text: `Poll by ${message.author.tag}` }).setTimestamp();
    const msg = await message.channel.send({ embeds: [embed] });
    for (let i = 0; i < options.length; i++) await msg.react(EMOJIS[i]).catch(() => {});
    await message.delete().catch(() => {});
  },
};
