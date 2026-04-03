import { Message } from "discord.js";
import { PrefixCommand } from "./index.js";

export const command: PrefixCommand = {
  name: "dice",
  usage: "%dice [sides] [count]",
  description: "Roll one or more dice",
  async execute(message: Message, args: string[]) {
    const sides = Math.min(100, Math.max(2, parseInt(args[0] ?? "6", 10)));
    const count = Math.min(10, Math.max(1, parseInt(args[1] ?? "1", 10)));
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);
    await message.reply(count === 1 ? `🎲 You rolled **${total}** (d${sides})` : `🎲 **${count}d${sides}:** ${rolls.join(", ")} = **${total}**`);
  },
};
