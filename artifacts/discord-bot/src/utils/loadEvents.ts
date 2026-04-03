import { Client } from "discord.js";
import { readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadEvents(client: Client) {
  const eventsPath = resolve(__dirname, "../events");
  const eventFiles = readdirSync(eventsPath).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = pathToFileURL(resolve(eventsPath, file)).href;
    const event = await import(filePath);
    if (event.once) {
      client.once(event.name, (...args: any[]) => event.execute(...args));
    } else {
      client.on(event.name, (...args: any[]) => event.execute(...args));
    }
    console.log(`Loaded event: ${event.name}`);
  }
}
