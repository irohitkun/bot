import { Events, Message } from "discord.js";
import { readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { PrefixCommand } from "../prefixCommands/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PREFIX = "%";

const prefixCommands = new Map<string, PrefixCommand>();

async function loadPrefixCommands() {
  const dir = resolve(__dirname, "../prefixCommands");
  const files = readdirSync(dir).filter(
    (f) => (f.endsWith(".ts") || f.endsWith(".js")) && f !== "index.ts" && f !== "index.js"
  );

  for (const file of files) {
    const mod = await import(pathToFileURL(resolve(dir, file)).href);
    if (mod.command?.name) {
      prefixCommands.set(mod.command.name, mod.command);
    }
  }

  console.log(`Loaded ${prefixCommands.size} prefix commands.`);
}

loadPrefixCommands();

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message: Message) {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  const command = prefixCommands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (err) {
    console.error(`Error in prefix command %${commandName}:`, err);
    await message.reply("❌ An error occurred while running that command.").catch(() => {});
  }
}
