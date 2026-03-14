import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const LANGUAGES: Record<string, string> = {
  english: "English",
  spanish: "Spanish",
  french: "French",
  german: "German",
  italian: "Italian",
  portuguese: "Portuguese",
  russian: "Russian",
  japanese: "Japanese",
  korean: "Korean",
  chinese: "Chinese (Simplified)",
  arabic: "Arabic",
  hindi: "Hindi",
  turkish: "Turkish",
  dutch: "Dutch",
  polish: "Polish",
  swedish: "Swedish",
  norwegian: "Norwegian",
  danish: "Danish",
  greek: "Greek",
  hebrew: "Hebrew",
  indonesian: "Indonesian",
  vietnamese: "Vietnamese",
  thai: "Thai",
  ukrainian: "Ukrainian",
};

export const data = new SlashCommandBuilder()
  .setName("translate")
  .setDescription("Translate text into another language")
  .addStringOption((opt) =>
    opt.setName("text").setDescription("The text to translate").setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName("to")
      .setDescription("Target language")
      .setRequired(true)
      .addChoices(
        ...Object.entries(LANGUAGES).map(([value, name]) => ({ name, value }))
      )
  )
  .addStringOption((opt) =>
    opt
      .setName("from")
      .setDescription("Source language (leave blank to auto-detect)")
      .setRequired(false)
      .addChoices(
        ...Object.entries(LANGUAGES).map(([value, name]) => ({ name, value }))
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const text = interaction.options.getString("text", true);
  const toKey = interaction.options.getString("to", true);
  const fromKey = interaction.options.getString("from");

  const toLang = LANGUAGES[toKey];
  const fromLang = fromKey ? LANGUAGES[fromKey] : null;

  await interaction.deferReply();

  const systemPrompt = fromLang
    ? `You are a professional translator. Translate the following text from ${fromLang} to ${toLang}. Return only the translated text, nothing else.`
    : `You are a professional translator. Detect the language of the following text and translate it to ${toLang}. Return only the translated text, nothing else.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
  });

  const translated = response.choices[0]?.message?.content?.trim();

  if (!translated) {
    return interaction.editReply("Could not translate the text. Please try again.");
  }

  const detectedInfo = fromLang ? `**From:** ${fromLang}` : "**From:** Auto-detected";

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🌐 Translation")
    .addFields(
      { name: "Original", value: text.length > 1024 ? text.slice(0, 1021) + "..." : text },
      { name: "Translated", value: translated.length > 1024 ? translated.slice(0, 1021) + "..." : translated },
    )
    .setFooter({ text: `${detectedInfo} → To: ${toLang} • Requested by ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
