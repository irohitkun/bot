import { db, premiumGuildsTable } from "../db/index.js";
import { eq } from "drizzle-orm";

const premiumCache = new Map<string, boolean>();

export function isBotOwner(userId: string): boolean {
  const owners = (process.env.BOT_OWNERS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return owners.includes(userId);
}

export async function isPremiumGuild(guildId: string): Promise<boolean> {
  if (premiumCache.has(guildId)) return premiumCache.get(guildId)!;
  const [row] = await db.select().from(premiumGuildsTable).where(eq(premiumGuildsTable.guildId, guildId));
  const result = !!row;
  premiumCache.set(guildId, result);
  return result;
}

export function invalidatePremiumCache(guildId: string) {
  premiumCache.delete(guildId);
}
