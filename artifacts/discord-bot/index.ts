import { Client, GatewayIntentBits, Collection } from "discord.js";
import { createServer, get as httpGet } from "http";
import { loadCommands } from "./src/utils/loadCommands.js";
import { loadEvents } from "./src/utils/loadEvents.js";

if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error("DISCORD_BOT_TOKEN is required.");
}

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

export const commands = new Collection<string, any>();

function keepAlive() {
  const port = parseInt(process.env.PORT ?? "3000", 10);
  createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", bot: client.user?.tag ?? "starting", uptime: process.uptime() }));
  }).listen(port, () => console.log(`Keep-alive server on port ${port}`));
  setInterval(() => {
    httpGet(`http://localhost:${port}/ping`, () => {}).on("error", () => {});
  }, 5 * 60 * 1000);
}

async function main() {
  await loadCommands(commands);
  await loadEvents(client);
  await client.login(process.env.DISCORD_BOT_TOKEN);
  keepAlive();
}

main().catch((err) => { console.error("Fatal error:", err); process.exit(1); });
