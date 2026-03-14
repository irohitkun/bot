import { db, guildSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const DEFAULT_PREFIX = "%";
const cache = new Map<string, string>();

export async function getPrefix(guildId: string): Promise<string> {
  if (cache.has(guildId)) return cache.get(guildId)!;

  const [settings] = await db
    .select()
    .from(guildSettingsTable)
    .where(eq(guildSettingsTable.guildId, guildId));

  const prefix = settings?.prefix ?? DEFAULT_PREFIX;
  cache.set(guildId, prefix);
  return prefix;
}

export async function setPrefix(guildId: string, prefix: string): Promise<void> {
  await db
    .insert(guildSettingsTable)
    .values({ guildId, prefix })
    .onConflictDoUpdate({
      target: guildSettingsTable.guildId,
      set: { prefix, updatedAt: new Date() },
    });

  cache.set(guildId, prefix);
}
