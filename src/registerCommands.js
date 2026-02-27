import { REST, Routes } from "discord.js";
import { config } from "./config.js";
import { commandData } from "./commands/commandRegistry.js";

const rest = new REST({ version: "10" }).setToken(config.discordToken);

async function register() {
  if (config.discordGuildId) {
    await rest.put(
      Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId),
      { body: commandData }
    );
    console.log(`Registered ${commandData.length} guild commands to ${config.discordGuildId}.`);
    return;
  }

  await rest.put(Routes.applicationCommands(config.discordClientId), {
    body: commandData
  });
  console.log(`Registered ${commandData.length} global commands.`);
}

register().catch((error) => {
  console.error(error);
  process.exit(1);
});
