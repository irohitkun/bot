import { Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from "./index.js";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const LANGUAGE_MAP: Record<string, string> = {
  english: "English", en: "English",
  spanish: "Spanish", es: "Spanish",
  french: "French", fr: "French",
  german: "German", de: "German",
  italian: "Italian", it: "Italian",
  portuguese: "Portuguese", pt: "Portuguese",
  russian: "Russian", ru: "Russian",
  japanese: "Japanese", ja: "Japanese",
  korean: "Korean", ko: "Korean",
  chinese: "Chinese (Simplified)", zh: "Chinese (Simplified)",
  arabic: "Arabic", ar: "Arabic",
  hindi: "Hindi", hi: "Hindi",
  turkish: "Turkish", tr: "Turkish",
  dutch: "Dutch", nl: "Dutch",
  polish: "Polish", pl: "Polish",
  swedish: "Swedish", sv: "Swedish",
  greek: "Greek", el: "Greek",
  hebrew: "Hebrew", he: "Hebrew",
  ukrainian: "Ukrainian", uk: "Ukrainian",
};

export const command: PrefixCommand = {
  name: "translate",
  usage: "%translate <language> <text>",
  description: "Translate text into another language",
  async execute(message: Message, args: string[]) {
    if (args.length < 2) {
      return void message.reply(`Usage: \`${this.usage}\`\nExample: \`%translate spanish Hello world!\``);
    }

    const langInput = args[0].toLowerCase();
    const toLang = LANGUAGE_MAP[langInput];
    if (!toLang) {
      return void message.reply(`❌ Unknown language \`${args[0]}\`. Try: english, spanish, french, german, japanese, korean, chinese, arabic, russian, etc.`);
    }

    const text = args.slice(1).join(" ");
    const typing = await message.channel.sendTyping().catch(() => {});

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Detect the language of the text and translate it to ${toLang}. Return only the translated text, nothing else.`,
        },
        { role: "user", content: text },
      ],
    });

    const translated = response.choices[0]?.message?.content?.trim();
    if (!translated) return void message.reply("❌ Translation failed. Please try again.");

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🌐 Translation")
      .addFields(
        { name: "Original", value: text.length > 1024 ? text.slice(0, 1021) + "..." : text },
        { name: `Translated to ${toLang}`, value: translated.length > 1024 ? translated.slice(0, 1021) + "..." : translated }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
