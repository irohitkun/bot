import { Message } from "discord.js";
import { PrefixCommand } from "./index.js";

export const command: PrefixCommand = {
  name: "coinflip",
  usage: "%coinflip [heads|tails]",
  description: "Flip a coin",
  async execute(message: Message, args: string[]) {
    const call = args[0]?.toLowerCase();
    const result = Math.random() < 0.5 ? "heads" : "tails";
    const coin = result === "heads" ? "🪙 Heads!" : "🪙 Tails!";
    if (!call || !["heads", "tails"].includes(call)) return void message.reply(coin);
    const won = call === result;
    await message.reply(`${coin} You called **${call}** — ${won ? "you win! 🎉" : "you lose! 😬"}`);
  },
};
