import { db, serverCustomizationTable } from "../db/index.js";
import { eq } from "drizzle-orm";

export interface GuildStyle {
  color: number;
  footer: string | null;
}

const styleCache = new Map<string, GuildStyle>();
const DEFAULT_COLOR = 0x5865f2;

export async function getGuildStyle(guildId: string): Promise<GuildStyle> {
  if (styleCache.has(guildId)) return styleCache.get(guildId)!;
  const [row] = await db.select().from(serverCustomizationTable).where(eq(serverCustomizationTable.guildId, guildId));
  const style: GuildStyle = {
    color: row?.embedColor ? parseInt(row.embedColor.replace("#", ""), 16) || DEFAULT_COLOR : DEFAULT_COLOR,
    footer: row?.footerText ?? null,
  };
  styleCache.set(guildId, style);
  return style;
}

export function invalidateStyleCache(guildId: string) {
  styleCache.delete(guildId);
}

export async function getWelcomeConfig(guildId: string) {
  const [row] = await db.select().from(serverCustomizationTable).where(eq(serverCustomizationTable.guildId, guildId));
  return { channelId: row?.welcomeChannelId ?? null, message: row?.welcomeMessage ?? null };
}

export async function getLogChannel(guildId: string): Promise<string | null> {
  const [row] = await db.select().from(serverCustomizationTable).where(eq(serverCustomizationTable.guildId, guildId));
  return row?.logChannelId ?? null;
}

export function hexToInt(hex: string): number | null {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return parseInt(clean, 16);
}
