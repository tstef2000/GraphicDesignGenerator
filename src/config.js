import dotenv from "dotenv";

dotenv.config();

const required = ["DISCORD_BOT_TOKEN", "DISCORD_CLIENT_ID", "GEMINI_API_KEY"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

export const config = {
  discordToken: process.env.DISCORD_BOT_TOKEN,
  discordClientId: process.env.DISCORD_CLIENT_ID,
  discordGuildId: process.env.DISCORD_GUILD_ID,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiImageModel: (process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview").trim(),
  maxImagesPerRequest: Number(process.env.MAX_IMAGES_PER_REQUEST || 1),
  allowNsfw: String(process.env.ALLOW_NSFW || "false").toLowerCase() === "true"
};
