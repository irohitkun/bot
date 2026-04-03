import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getGuildStyle, hexToInt } from "../utils/guildStyle.js";

function hexToRgb(hex: string) {
  const v = parseInt(hex, 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export const data = new SlashCommandBuilder()
  .setName("color")
  .setDescription("View details about a hex color")
  .addStringOption((opt) => opt.setName("hex").setDescription("Hex color code e.g. #ff5733 or ff5733").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const input = interaction.options.getString("hex", true).replace("#", "").trim();
  const colorInt = hexToInt(input);
  if (colorInt === null) return interaction.reply({ content: "❌ Invalid hex color. Use a 6-digit hex code like `ff5733`.", flags: 64 });

  const { r, g, b } = hexToRgb(input);
  const { h, s, l } = rgbToHsl(r, g, b);
  const dec = colorInt;

  const embed = new EmbedBuilder()
    .setColor(colorInt)
    .setTitle(`🎨 Color: #${input.toUpperCase()}`)
    .addFields(
      { name: "Hex", value: `#${input.toUpperCase()}`, inline: true },
      { name: "RGB", value: `rgb(${r}, ${g}, ${b})`, inline: true },
      { name: "HSL", value: `hsl(${h}°, ${s}%, ${l}%)`, inline: true },
      { name: "Decimal", value: `${dec}`, inline: true },
    )
    .setThumbnail(`https://singlecolorimage.com/get/${input}/64x64`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
