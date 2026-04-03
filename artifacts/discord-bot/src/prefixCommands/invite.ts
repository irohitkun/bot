import { Message } from "discord.js";
import { PrefixCommand } from "./index.js";

export const command: PrefixCommand = {
  name: "invite",
  usage: "%invite",
  description: "Get the bot's invite link",
  async execute(message: Message) {
    const clientId = message.client.user!.id;
    const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
    await message.reply(`➕ **Invite me to your server:** [Click here](${url})`);
  },
};
