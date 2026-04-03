import { Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from "./index.js";
import { getPrefix } from "../utils/prefixCache.js";
import { isPremiumGuild } from "../utils/permissions.js";

export const command: PrefixCommand = {
  name: "help",
  usage: "%help",
  description: "Show all available commands",
  async execute(message: Message) {
    const prefix = await getPrefix(message.guild!.id);
    const premium = await isPremiumGuild(message.guild!.id);
    const p = prefix;

    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle("🤖 Bot Commands")
      .setDescription(`Prefix: \`${p}\` — All commands also work as slash commands (\`/command\`)`)
      .addFields(
        { name: "🔨 Moderation", value: [`\`${p}ban @user [reason]\` — Ban`, `\`${p}kick @user [reason]\` — Kick`, `\`${p}mute @user <10m/1h> [reason]\` — Timeout`, `\`${p}unmute @user\` — Remove timeout`, `\`${p}unban <user_id>\` — Unban`].join("\n") },
        { name: "⚠️ Warnings", value: [`\`${p}warn @user <reason>\` — Warn`, `\`${p}warnings @user\` — View warnings`, `\`${p}clearwarn @user\` — Clear warnings`].join("\n") },
        { name: "🗑️ Channel", value: [`\`${p}purge <1-100> [@user]\` — Bulk delete`, `\`${p}slowmode <seconds>\` — Set slowmode`, `\`${p}lock [reason]\` — Lock channel`, `\`${p}unlock\` — Unlock channel`].join("\n") },
        { name: "🏷️ Roles", value: [`\`${p}role add @user @role\` — Add role`, `\`${p}role remove @user @role\` — Remove role`, `\`${p}role info @role\` — Role info`].join("\n") },
        { name: "🎉 Giveaways", value: [`\`${p}giveaway start <prize> <duration> [winners]\` — Start`, `\`${p}giveaway end <message_id>\` — End early`, `\`${p}giveaway reroll <message_id>\` — Reroll`].join("\n") },
        { name: "💤 AFK", value: [`\`${p}afk [reason]\` — Set AFK`, `\`${p}afkremove\` — Remove AFK`].join("\n") },
        { name: "🖼️ User", value: [`\`${p}avatar [@user]\` — Avatar`, `\`${p}banner [@user]\` — Banner`, `\`${p}userinfo [@user]\` — User info`, `\`${p}serverinfo\` — Server info`, `\`${p}ping\` — Latency`, `\`${p}snipe\` — Last deleted message`].join("\n") },
        { name: "🌐 Translation", value: `\`${p}translate [lang] <text>\` — Translate (default: English)` },
        { name: "⚙️ Config", value: [`\`${p}setprefix <prefix>\` — Change prefix`, `\`${p}invite\` — Bot invite link`].join("\n") },
        ...(premium ? [{ name: "⭐ Premium Features", value: ["✅ Automod (`/automod`)", "✅ No-Prefix Mode (`/noprefix`)"].join("\n") }] : [{ name: "⭐ Premium Features", value: "Contact us to unlock: Automod, No-Prefix Mode, and more!" }])
      )
      .setFooter({ text: `Use /help for more info | ${premium ? "⭐ Premium Server" : "Free Tier"}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
