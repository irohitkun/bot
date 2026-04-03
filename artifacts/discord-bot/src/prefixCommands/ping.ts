import { Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from "./index.js";

export const command: PrefixCommand = {
  name: "ping",
  usage: "%ping",
  description: "Check the bot's latency",
  async execute(message: Message) {
    const sent = await message.reply("📡 Pinging...");
    const roundtrip = sent.createdTimestamp - message.createdTimestamp;
    const ws = message.client.ws.ping;
    const embed = new EmbedBuilder()
      .setColor(roundtrip < 100 ? 0x57f287 : roundtrip < 250 ? 0xfee75c : 0xed4245)
      .setTitle("🏓 Pong!")
      .addFields({ name: "Roundtrip", value: `\`${roundtrip}ms\``, inline: true }, { name: "WebSocket", value: `\`${ws}ms\``, inline: true })
      .setTimestamp();
    await sent.edit({ content: null, embeds: [embed] });
  },
};
