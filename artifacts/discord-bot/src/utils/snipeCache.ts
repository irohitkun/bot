import { Message } from "discord.js";

interface SnipedMessage {
  content: string;
  authorId: string;
  authorTag: string;
  authorAvatar: string | null;
  deletedAt: Date;
  imageUrl: string | null;
}

const snipeCache = new Map<string, SnipedMessage>();

export function setSnipe(channelId: string, message: Message) {
  const imageUrl = message.attachments.find((a) => a.contentType?.startsWith("image/"))?.url ?? null;
  snipeCache.set(channelId, {
    content: message.content,
    authorId: message.author.id,
    authorTag: message.author.tag,
    authorAvatar: message.author.displayAvatarURL(),
    deletedAt: new Date(),
    imageUrl,
  });
}

export function getSnipe(channelId: string): SnipedMessage | null {
  return snipeCache.get(channelId) ?? null;
}
