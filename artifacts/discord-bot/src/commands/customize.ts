import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { db, serverCustomizationTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { isPremiumGuild } from "../utils/permissions.js";
import { getGuildStyle, invalidateStyleCache, hexToInt } from "../utils/guildStyle.js";

export const data = new SlashCommandBuilder()
  .setName("customize")
  .setDescription("Customize how the bot looks in your server (Premium only)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((sub) =>
    sub.setName("color")
      .setDescription("Change the color of bot embeds (hex code, e.g. #ff5733)")
      .addStringOption((opt) => opt.setName("hex").setDescription("Hex color code e.g. #ff5733 or ff5733").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("footer")
      .setDescription("Set a custom footer on bot messages")
      .addStringOption((opt) => opt.setName("text").setDescription("Footer text (max 100 chars), or 'none' to remove").setRequired(true).setMaxLength(100))
  )
  .addSubcommand((sub) =>
    sub.setName("nickname")
      .setDescription("Set the bot's nickname in this server")
      .addStringOption((opt) => opt.setName("name").setDescription("Nickname (max 32 chars), or 'reset' to clear").setRequired(true).setMaxLength(32))
  )
  .addSubcommand((sub) =>
    sub.setName("preview")
      .setDescription("Preview your current bot appearance settings")
  )
  .addSubcommand((sub) =>
    sub.setName("reset")
      .setDescription("Reset all appearance settings back to default")
  );

async function upsert(guildId: string, data: Partial<typeof serverCustomizationTable.$inferInsert>) {
  await db.insert(serverCustomizationTable)
    .values({ guildId, ...data })
    .onConflictDoUpdate({ target: serverCustomizationTable.guildId, set: { ...data, updatedAt: new Date() } });
  invalidateStyleCache(guildId);
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guild!.id;

  if (!(await isPremiumGuild(guildId))) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle("⭐ Premium Feature")
          .setDescription("**Bot customization is a Premium feature.**\n\nUpgrade your server to Premium to unlock:\n• Custom embed colors\n• Custom bot footer text\n• Custom bot nickname\n• Custom welcome messages\n• And more!\n\nContact the bot owner to activate Premium for your server.")
          .setTimestamp()
      ],
      flags: 64,
    });
  }

  const sub = interaction.options.getSubcommand();

  if (sub === "color") {
    const hex = interaction.options.getString("hex", true).replace("#", "").trim();
    const colorInt = hexToInt(hex);
    if (colorInt === null) return interaction.reply({ content: "❌ Invalid hex color. Example: `#ff5733` or `ff5733`.", flags: 64 });
    await upsert(guildId, { embedColor: hex });
    const embed = new EmbedBuilder().setColor(colorInt)
      .setTitle("🎨 Embed Color Updated")
      .setDescription(`All bot embeds in this server will now use **#${hex.toUpperCase()}** as their color.\n\nThis preview embed shows the new color!`)
      .setFooter({ text: "Customize your bot with /customize" }).setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "footer") {
    const text = interaction.options.getString("text", true);
    const footerText = text.toLowerCase() === "none" ? null : text;
    await upsert(guildId, { footerText: footerText ?? undefined });
    const style = await getGuildStyle(guildId);
    const embed = new EmbedBuilder().setColor(style.color)
      .setTitle("📝 Footer Text Updated")
      .setDescription(footerText ? `Bot embeds will now show: **"${footerText}"** as the footer.` : "Footer text has been removed.")
      .setFooter(footerText ? { text: footerText } : { text: "No footer set" }).setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "nickname") {
    const name = interaction.options.getString("name", true);
    const botMember = interaction.guild!.members.me!;
    if (name.toLowerCase() === "reset") {
      await botMember.setNickname(null, `Reset by ${interaction.user.tag}`).catch(() => null);
      return interaction.reply({ content: "✅ Bot nickname has been reset to default.", flags: 64 });
    }
    const success = await botMember.setNickname(name, `Set by ${interaction.user.tag}`).catch(() => null);
    if (!success) return interaction.reply({ content: "❌ I don't have permission to change my own nickname.", flags: 64 });
    const style = await getGuildStyle(guildId);
    const embed = new EmbedBuilder().setColor(style.color)
      .setTitle("✅ Nickname Updated")
      .setDescription(`My nickname in this server is now **${name}**.`)
      .setFooter(style.footer ? { text: style.footer } : null).setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === "preview") {
    const style = await getGuildStyle(guildId);
    const [row] = await db.select().from(serverCustomizationTable).where(eq(serverCustomizationTable.guildId, guildId));
    const embed = new EmbedBuilder().setColor(style.color)
      .setTitle("🎨 Your Bot Appearance Settings")
      .addFields(
        { name: "Embed Color", value: row?.embedColor ? `**#${row.embedColor.toUpperCase()}**` : "Default (Blurple)", inline: true },
        { name: "Footer Text", value: row?.footerText ? `"${row.footerText}"` : "None", inline: true },
        { name: "Bot Nickname", value: interaction.guild!.members.me?.nickname ?? "Default", inline: true },
        { name: "Welcome Channel", value: row?.welcomeChannelId ? `<#${row.welcomeChannelId}>` : "Not set", inline: true },
        { name: "Log Channel", value: row?.logChannelId ? `<#${row.logChannelId}>` : "Not set", inline: true },
      )
      .setFooter({ text: style.footer ?? "This is your custom footer preview!" })
      .setDescription("This embed previews your current custom appearance.")
      .setTimestamp();
    return interaction.reply({ embeds: [embed], flags: 64 });
  }

  if (sub === "reset") {
    await db.delete(serverCustomizationTable).where(eq(serverCustomizationTable.guildId, guildId));
    invalidateStyleCache(guildId);
    await interaction.guild!.members.me?.setNickname(null).catch(() => null);
    return interaction.reply({ content: "✅ All appearance settings have been reset to default.", flags: 64 });
  }
}
