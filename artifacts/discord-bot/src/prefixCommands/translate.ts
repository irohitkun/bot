import { Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from "./index.js";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? undefined,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? "missing",
});

const LANG_NAMES: Record<string, string> = {
  english: "English", spanish: "Spanish", french: "French", german: "German",
  italian: "Italian", portuguese: "Portuguese", russian: "Russian", japanese: "Japanese",
  korean: "Korean", chinese: "Chinese", arabic: "Arabic", hindi: "Hindi",
};

export const command: PrefixCommand = {
  name: "translate",
  usage: "%translate [language] <text>",
  description: "Translate text (default: English)",
  async execute(message: Message, args: string[]) {
    if (args.length === 0) return void message.reply(`Usage: \`${this.usage}\`\nExample: \`%translate spanish Hello world\``);
    let toLang = "English";
    let text = args.join(" ");
    const possibleLang = args[0].toLowerCase();
    if (LANG_NAMES[possibleLang]) { toLang = LANG_NAMES[possibleLang]; text = args.slice(1).join(" "); }
    if (!text) return void message.reply("Please provide text to translate.");
    const reply = await message.reply("🌐 Translating...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 512,
      messages: [{ role: "system", content: `Detect the language and translate to ${toLang}. Return only the translation.` }, { role: "user", content: text }],
    });
    const translated = response.choices[0]?.message?.content?.trim() ?? "Could not translate.";
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle("🌐 Translation")
      .addFields({ name: "Original", value: text.slice(0, 1024) }, { name: `Translated to ${toLang}`, value: translated.slice(0, 1024) }).setTimestamp();
    await reply.edit({ content: null, embeds: [embed] });
  },
};
