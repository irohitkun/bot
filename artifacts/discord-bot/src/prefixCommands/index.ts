import { Message } from "discord.js";

export interface PrefixCommand {
  name: string;
  usage: string;
  description: string;
  execute: (message: Message, args: string[]) => Promise<void>;
}

export function parseMention(mention: string): string | null {
  const match = mention.match(/^<@!?(\d+)>$/);
  return match ? match[1] : null;
}

export function parseDuration(input: string): number | null {
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[match[2].toLowerCase()];
}
