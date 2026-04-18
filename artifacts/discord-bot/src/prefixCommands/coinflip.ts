import { Message } from "discord.js";
import { PrefixCommand } from "./index.js";

export const command: PrefixCommand = {
  name: "coinflip",
  usage: "%coinflip",
  description: "Flip a coin",
  async execute(message: Message) {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    await message.reply(`🪙 **${result}!**`);
  },
};
