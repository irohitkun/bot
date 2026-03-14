import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const guildSettingsTable = pgTable("guild_settings", {
  guildId: text("guild_id").primaryKey(),
  prefix: text("prefix").notNull().default("%"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GuildSettings = typeof guildSettingsTable.$inferSelect;
