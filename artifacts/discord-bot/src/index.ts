import { Client, GatewayIntentBits, Collection } from "discord.js";
import { loadCommands } from "./utils/loadCommands.js";
import { loadEvents } from "./utils/loadEvents.js";

if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error("DISCORD_BOT_TOKEN environment variable is required.");
}

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
  ],
});

export const commands = new Collection<string, any>();

async function main() {
  await loadCommands(commands);
  await loadEvents(client);

  await client.login(process.env.DISCORD_BOT_TOKEN);
}

main().catch((err) => {
  console.error("Fatal error starting bot:", err);
  process.exit(1);
});
