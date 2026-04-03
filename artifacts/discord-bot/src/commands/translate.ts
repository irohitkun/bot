import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? undefined,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? "missing",
});

const LANGUAGES: Record<string, string> = {
  english: "English", spanish: "Spanish", french: "French", german: "German",
  italian: "Italian", portuguese: "Portuguese", russian: "Russian", japanese: "Japanese",
  korean: "Korean", chinese: "Chinese (Simplified)", arabic: "Arabic", hindi: "Hindi",
  turkish: "Turkish", dutch: "Dutch", polish: "Polish",
};

export const data = new SlashCommandBuilder()
  .setName("translate")
  .setDescription("Translate text — defaults to English")
  .addStringOption((opt) => opt.setName("text").setDescription("Text to translate").setRequired(true))
  .addStringOption((opt) => opt.setName("to").setDescription("Target language (default: English)").setRequired(false).addChoices(...Object.entries(LANGUAGES).map(([v, n]) => ({ name: n, value: v }))))
  .addStringOption((opt) => opt.setName("from").setDescription("Source language (blank = auto-detect)").setRequired(false).addChoices(...Object.entries(LANGUAGES).map(([v, n]) => ({ name: n, value: v }))));

export async function execute(interaction: ChatInputCommandInteraction) {
  const text = interaction.options.getString("text", true);
  const toLang = LANGUAGES[interaction.options.getString("to") ?? "english"] ?? "English";
  const fromLang = interaction.options.getString("from") ? LANGUAGES[interaction.options.getString("from")!] : null;
  await interaction.deferReply();
  const systemPrompt = fromLang
    ? `Translate from ${fromLang} to ${toLang}. Return only the translated text.`
    : `Detect the language and translate to ${toLang}. Return only the translated text.`;
  const response = await openai.chat.completions.create({ model: "gpt-4o-mini", max_completion_tokens: 1024, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: text }] });
  const translated = response.choices[0]?.message?.content?.trim();
  if (!translated) return interaction.editReply("❌ Could not translate the text.");
  const embed = new EmbedBuilder().setColor(0x5865f2).setTitle("🌐 Translation")
    .addFields({ name: "Original", value: text.slice(0, 1024) }, { name: `Translated to ${toLang}`, value: translated.slice(0, 1024) })
    .setFooter({ text: `${fromLang ?? "Auto-detected"} → ${toLang}` }).setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}
