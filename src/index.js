import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import { getCommandHealthSnapshot, handleInteraction } from "./commands/commandRegistry.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);

  const initial = getCommandHealthSnapshot();
  console.log(
    `[health] ready=true success=${initial.success} errors=${initial.errors} lastError=${
      initial.lastError || "none"
    }`
  );

  setInterval(() => {
    const health = getCommandHealthSnapshot();
    console.log(
      `[health] ready=true success=${health.success} errors=${health.errors} lastError=${
        health.lastError || "none"
      } lastErrorAt=${health.lastErrorAt || "n/a"}`
    );
  }, 5 * 60 * 1000);
});

client.on(Events.InteractionCreate, async (interaction) => {
  await handleInteraction(interaction);
});

client.login(config.discordToken);
