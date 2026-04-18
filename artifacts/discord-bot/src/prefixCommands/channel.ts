import { Message, EmbedBuilder, PermissionFlagsBits, ChannelType, GuildChannel, TextChannel, CategoryChannel } from "discord.js";
import { PrefixCommand } from "./index.js";

export const command: PrefixCommand = {
  name: "channel",
  usage: "%channel <rename|move|topic|info|create|delete> [args]",
  description: "Manage channels",
  async execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return void message.reply("❌ You need the **Manage Channels** permission.");
    }

    const sub = args[0]?.toLowerCase();
    if (!sub) return void message.reply(`Usage: \`${this.usage}\``);

    if (sub === "rename") {
      const newName = args[1];
      if (!newName) return void message.reply("Usage: `%channel rename <new-name>`");
      const ch = message.channel as GuildChannel;
      const oldName = ch.name;
      await ch.setName(newName, `Renamed by ${message.author.tag}`);
      const embed = new EmbedBuilder().setColor(0x5865f2).setTitle("✅ Channel Renamed")
        .addFields(
          { name: "Before", value: `\`${oldName}\``, inline: true },
          { name: "After", value: `\`${newName}\``, inline: true },
        ).setTimestamp();
      return void message.reply({ embeds: [embed] });
    }

    if (sub === "topic") {
      const topic = args.slice(1).join(" ") || null;
      const ch = message.channel as TextChannel;
      if (ch.type !== ChannelType.GuildText && ch.type !== ChannelType.GuildAnnouncement) {
        return void message.reply("❌ Can only set topics on text or announcement channels.");
      }
      await ch.setTopic(topic, `Topic updated by ${message.author.tag}`);
      return void message.reply(`✅ Topic ${topic ? `set to: **${topic}**` : "cleared."}`);
    }

    if (sub === "info") {
      const ch = message.channel as GuildChannel;
      const typeNames: Record<number, string> = {
        [ChannelType.GuildText]: "Text",
        [ChannelType.GuildVoice]: "Voice",
        [ChannelType.GuildCategory]: "Category",
        [ChannelType.GuildAnnouncement]: "Announcement",
        [ChannelType.GuildStageVoice]: "Stage",
        [ChannelType.GuildForum]: "Forum",
      };
      const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`📋 Channel Info — #${ch.name}`)
        .addFields(
          { name: "ID", value: ch.id, inline: true },
          { name: "Type", value: typeNames[ch.type] ?? "Unknown", inline: true },
          { name: "Category", value: ch.parent?.name ?? "None", inline: true },
          { name: "Position", value: `${ch.position}`, inline: true },
          { name: "Created", value: `<t:${Math.floor(ch.createdTimestamp! / 1000)}:R>`, inline: true },
        ).setTimestamp();
      if ("topic" in ch && (ch as TextChannel).topic) embed.addFields({ name: "Topic", value: (ch as TextChannel).topic! });
      return void message.reply({ embeds: [embed] });
    }

    if (sub === "create") {
      const name = args[1];
      if (!name) return void message.reply("Usage: `%channel create <name> [text|voice]`");
      const typeStr = args[2]?.toLowerCase() ?? "text";
      const channelType = typeStr === "voice" ? ChannelType.GuildVoice : ChannelType.GuildText;
      const created = await message.guild!.channels.create({ name, type: channelType, reason: `Created by ${message.author.tag}` });
      return void message.reply(`✅ Created <#${created.id}>.`);
    }

    if (sub === "delete") {
      const id = args[1];
      if (!id) return void message.reply("Usage: `%channel delete <channel-id>`");
      const ch = message.guild!.channels.cache.get(id);
      if (!ch) return void message.reply("❌ Channel not found.");
      const name = ch.name;
      await (ch as GuildChannel).delete(`Deleted by ${message.author.tag}`);
      return void message.reply(`✅ Deleted \`#${name}\`.`);
    }

    if (sub === "move") {
      const categoryId = args[1];
      if (!categoryId) return void message.reply("Usage: `%channel move <category-id>`");
      const category = message.guild!.channels.cache.get(categoryId) as CategoryChannel | undefined;
      if (!category || category.type !== ChannelType.GuildCategory) return void message.reply("❌ That is not a valid category.");
      const ch = message.channel as GuildChannel;
      await ch.setParent(category.id, { lockPermissions: false, reason: `Moved by ${message.author.tag}` });
      return void message.reply(`✅ Moved to category **${category.name}**.`);
    }

    await message.reply(`Usage: \`${this.usage}\``);
  },
};
