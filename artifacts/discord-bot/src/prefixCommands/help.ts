import { Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from "./index.js";
import { getPrefix } from "../utils/prefixCache.js";
import { isPremiumGuild } from "../utils/permissions.js";
import { getGuildStyle } from "../utils/guildStyle.js";

export const command: PrefixCommand = {
  name: "help",
  usage: "%help",
  description: "Show all available commands",
  async execute(message: Message) {
    const prefix = await getPrefix(message.guild!.id);
    const premium = await isPremiumGuild(message.guild!.id);
    const style = await getGuildStyle(message.guild!.id);
    const p = prefix;

    const embed = new EmbedBuilder().setColor(style.color)
      .setTitle("🤖 Bot Commands")
      .setDescription(`Prefix: \`${p}\` — All commands also work as slash commands (\`/command\`)`)
      .addFields(
        { name: "🔨 Moderation", value: [`\`${p}ban\``, `\`${p}kick\``, `\`${p}mute\``, `\`${p}unmute\``, `\`${p}unban\``, `\`${p}warn\``, `\`${p}warnings\``, `\`${p}clearwarn\``].join(" • ") },
        { name: "🗑️ Channel", value: [`\`${p}purge\``, `\`${p}slowmode\``, `\`${p}lock\``, `\`${p}unlock\``].join(" • ") },
        { name: "🏷️ Roles", value: [`\`${p}role add\``, `\`${p}role remove\``, `\`${p}role info\``].join(" • ") },
        { name: "🎉 Giveaways", value: [`\`${p}giveaway start\``, `\`${p}giveaway end\``, `\`${p}giveaway reroll\``].join(" • ") },
        { name: "💤 AFK", value: [`\`${p}afk [reason]\``, `\`${p}afkremove\``].join(" • ") },
        { name: "🎲 Fun", value: [`\`${p}8ball\``, `\`${p}coinflip\``, `\`${p}dice\``, `\`${p}poll\``, `\`${p}math\``].join(" • ") },
        { name: "🖼️ User", value: [`\`${p}avatar\``, `\`${p}banner\``, `\`${p}userinfo\``, `\`${p}serverinfo\``, `\`${p}ping\``, `\`${p}snipe\``, `\`${p}botinfo\``, `\`${p}color\``].join(" • ") },
        { name: "⏰ Tools", value: [`\`${p}remind\``, `\`${p}translate\``].join(" • ") },
        { name: "⚙️ Config", value: [`\`${p}setprefix\``, `\`${p}invite\``].join(" • ") },
        ...(premium ? [
          { name: "⭐ Premium — Customization", value: [`\`/customize color\``, `\`/customize footer\``, `\`/customize nickname\``, `\`/customize preview\``].join(" • ") },
          { name: "⭐ Premium — Features", value: [`\`/automod\``, `\`/noprefix\``, `\`/embed\``, `\`/welcome\``, `\`/logs\``].join(" • ") },
        ] : [
          { name: "⭐ Premium Features (Locked)", value: "Unlock: Custom embed colors, bot nickname & footer, automod, no-prefix mode, custom welcome messages, mod logs, custom embeds.\nContact us to activate Premium!" }
        ])
      )
      .setFooter({ text: style.footer ?? `${premium ? "⭐ Premium Server" : "Free Tier"} • Use /help for slash commands` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
