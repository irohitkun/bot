import { Message } from "discord.js";
import { PrefixCommand } from "./index.js";

function safeEval(expr: string): number | null {
  const clean = expr.replace(/[^0-9+\-*/.() %]/g, "");
  if (!clean) return null;
  try {
    const result = Function(`"use strict"; return (${clean})`)();
    if (typeof result !== "number" || !isFinite(result)) return null;
    return Math.round(result * 1e10) / 1e10;
  } catch { return null; }
}

export const command: PrefixCommand = {
  name: "math",
  usage: "%math <expression>",
  description: "Calculate a math expression",
  async execute(message: Message, args: string[]) {
    const expr = args.join(" ");
    if (!expr) return void message.reply(`Usage: \`${this.usage}\``);
    const result = safeEval(expr);
    if (result === null) return void message.reply("❌ Invalid expression.");
    await message.reply(`🧮 \`${expr}\` = **${result}**`);
  },
};
