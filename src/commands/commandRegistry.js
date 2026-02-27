import {
  AttachmentBuilder,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";
import { generateImageWithGemini, prepareReferenceImages } from "../services/geminiService.js";
import {
  addReference,
  clearReferences,
  listReferences,
  removeReference
} from "../services/referenceStore.js";
import { buildLogoPrompt, buildRemixPrompt } from "../utils/promptBuilder.js";
import {
  getInspirationPack,
  rustInspirationChoices,
  rustInspirationPacks
} from "../utils/rustInspiration.js";
import { styleChoices, stylePresets } from "../utils/stylePresets.js";
import { cleanText, parseColors } from "../utils/validators.js";

const commandHealth = {
  success: 0,
  errors: 0,
  lastError: null,
  lastErrorAt: null
};

const complexityChoices = [
  { name: "Simple", value: "simple" },
  { name: "Balanced", value: "balanced" },
  { name: "Detailed", value: "detailed" }
];

const iconFocusChoices = [
  { name: "Emblem", value: "emblem" },
  { name: "Mascot", value: "mascot" },
  { name: "Monogram", value: "monogram" },
  { name: "Symbol Only", value: "symbol-only" },
  { name: "Typography", value: "typography" }
];

const aspectRatioChoices = [
  { name: "1:1 (Icon)", value: "1:1" },
  { name: "4:3", value: "4:3" },
  { name: "16:9 (Banner-ish)", value: "16:9" }
];

const advancedTextureChoices = [
  { name: "Clean Flat", value: "clean-flat" },
  { name: "Distressed", value: "distressed" },
  { name: "Metal/Rusted", value: "metal-rusted" },
  { name: "Neon", value: "neon" },
  { name: "Painted", value: "painted" }
];

const emblemShapeChoices = [
  { name: "Shield", value: "shield" },
  { name: "Circle", value: "circle" },
  { name: "Hex", value: "hex" },
  { name: "Triangle", value: "triangle" },
  { name: "Freeform", value: "freeform" }
];

const typographyCaseChoices = [
  { name: "Uppercase", value: "uppercase" },
  { name: "Title Case", value: "title-case" },
  { name: "Mixed", value: "mixed" }
];

const saturationChoices = [
  { name: "Muted", value: "muted" },
  { name: "Balanced", value: "balanced" },
  { name: "Vibrant", value: "vibrant" }
];

function mimeToExtension(mimeType = "image/png") {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  return "png";
}

function collectAttachmentOptions(options) {
  return [
    options.getAttachment("reference_image_1"),
    options.getAttachment("reference_image_2"),
    options.getAttachment("reference_image_3")
  ].filter(Boolean);
}

function createLogoCommand() {
  const cmd = new SlashCommandBuilder()
    .setName("logo")
    .setDescription("Generate a Rust team/server logo with AI")
    .addStringOption((o) =>
      o
        .setName("description")
        .setDescription("What should the logo represent?")
        .setRequired(true)
        .setMaxLength(500)
    )
    .addStringOption((o) =>
      o
        .setName("style")
        .setDescription("Recommended style preset")
        .setRequired(false)
        .addChoices(...styleChoices.slice(0, 25))
    )
    .addStringOption((o) =>
      o
        .setName("inspiration_pack")
        .setDescription("Rust logo trend direction")
        .setRequired(false)
        .addChoices(...rustInspirationChoices)
    )
    .addStringOption((o) =>
      o
        .setName("custom_style")
        .setDescription("Custom style text, if you want")
        .setRequired(false)
        .setMaxLength(200)
    )
    .addStringOption((o) =>
      o
        .setName("colors")
        .setDescription("Comma-separated HEX colors (max 8), example: #F97316,#111827")
        .setRequired(false)
        .setMaxLength(80)
    )
    .addStringOption((o) =>
      o
        .setName("font")
        .setDescription("Font direction, ex: blocky stencil sans")
        .setRequired(false)
        .setMaxLength(120)
    )
    .addBooleanOption((o) => o.setName("glow").setDescription("Enable glow lighting").setRequired(false))
    .addStringOption((o) =>
      o
        .setName("text")
        .setDescription("Team/server text to include")
        .setRequired(false)
        .setMaxLength(64)
    )
    .addStringOption((o) =>
      o
        .setName("mascot")
        .setDescription("Mascot/object/animal to center")
        .setRequired(false)
        .setMaxLength(120)
    )
    .addStringOption((o) =>
      o
        .setName("vibe")
        .setDescription("Mood: intimidating, tactical, elite, etc")
        .setRequired(false)
        .setMaxLength(120)
    )
    .addStringOption((o) =>
      o
        .setName("complexity")
        .setDescription("How detailed should it be?")
        .setRequired(false)
        .addChoices(...complexityChoices)
    )
    .addStringOption((o) =>
      o
        .setName("icon_focus")
        .setDescription("Main composition focus")
        .setRequired(false)
        .addChoices(...iconFocusChoices)
    )
    .addStringOption((o) =>
      o
        .setName("aspect_ratio")
        .setDescription("Best fit for icon or banner usage")
        .setRequired(false)
        .addChoices(...aspectRatioChoices)
    )
    .addBooleanOption((o) =>
      o
        .setName("include_saved_refs")
        .setDescription("Use your saved reference images too (default true)")
        .setRequired(false)
    )
    .addStringOption((o) =>
      o
        .setName("negative_prompt")
        .setDescription("What to avoid")
        .setRequired(false)
        .setMaxLength(200)
    )
    .addAttachmentOption((o) =>
      o.setName("reference_image_1").setDescription("Optional reference image 1").setRequired(false)
    )
    .addAttachmentOption((o) =>
      o.setName("reference_image_2").setDescription("Optional reference image 2").setRequired(false)
    )
    .addAttachmentOption((o) =>
      o.setName("reference_image_3").setDescription("Optional reference image 3").setRequired(false)
    );

  return cmd;
}

function createLogoAdvancedCommand() {
  return new SlashCommandBuilder()
    .setName("logo-advanced")
    .setDescription("Advanced Rust logo generation controls")
    .addStringOption((o) =>
      o.setName("description").setDescription("Logo concept description").setRequired(true).setMaxLength(500)
    )
    .addStringOption((o) =>
      o
        .setName("style")
        .setDescription("Style preset")
        .setRequired(false)
        .addChoices(...styleChoices.slice(0, 25))
    )
    .addStringOption((o) =>
      o
        .setName("inspiration_pack")
        .setDescription("Rust logo trend direction")
        .setRequired(false)
        .addChoices(...rustInspirationChoices)
    )
    .addStringOption((o) =>
      o.setName("custom_style").setDescription("Custom style override").setRequired(false).setMaxLength(200)
    )
    .addStringOption((o) =>
      o
        .setName("colors")
        .setDescription("Comma-separated HEX colors (max 8)")
        .setRequired(false)
        .setMaxLength(80)
    )
    .addStringOption((o) => o.setName("font").setDescription("Font direction").setRequired(false).setMaxLength(120))
    .addBooleanOption((o) => o.setName("glow").setDescription("Enable glow").setRequired(false))
    .addStringOption((o) =>
      o
        .setName("texture")
        .setDescription("Texture direction")
        .setRequired(false)
        .addChoices(...advancedTextureChoices)
    )
    .addStringOption((o) =>
      o
        .setName("emblem_shape")
        .setDescription("Preferred emblem shape")
        .setRequired(false)
        .addChoices(...emblemShapeChoices)
    )
    .addIntegerOption((o) =>
      o
        .setName("shadow_strength")
        .setDescription("0 to 100")
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(100)
    )
    .addStringOption((o) =>
      o
        .setName("typography_case")
        .setDescription("Preferred letter case")
        .setRequired(false)
        .addChoices(...typographyCaseChoices)
    )
    .addStringOption((o) =>
      o
        .setName("saturation")
        .setDescription("Color saturation preference")
        .setRequired(false)
        .addChoices(...saturationChoices)
    )
    .addStringOption((o) =>
      o.setName("text").setDescription("Team/server name text").setRequired(false).setMaxLength(64)
    )
    .addStringOption((o) =>
      o.setName("negative_prompt").setDescription("What to avoid").setRequired(false).setMaxLength(200)
    )
    .addAttachmentOption((o) =>
      o.setName("reference_image_1").setDescription("Optional reference image 1").setRequired(false)
    )
    .addAttachmentOption((o) =>
      o.setName("reference_image_2").setDescription("Optional reference image 2").setRequired(false)
    )
    .addAttachmentOption((o) =>
      o.setName("reference_image_3").setDescription("Optional reference image 3").setRequired(false)
    );
}

function createStylesCommand() {
  return new SlashCommandBuilder().setName("styles").setDescription("Show recommended Rust logo style presets");
}

function createInspirationCommand() {
  return new SlashCommandBuilder()
    .setName("inspiration")
    .setDescription("Show Rust logo trend packs and usage guidance");
}

function createRemixCommand() {
  return new SlashCommandBuilder()
    .setName("remix")
    .setDescription("Remix an existing logo using your uploaded reference")
    .addAttachmentOption((o) =>
      o.setName("source_image").setDescription("Original logo/image to remix").setRequired(true)
    )
    .addStringOption((o) =>
      o
        .setName("description")
        .setDescription("How should the remix change?")
        .setRequired(true)
        .setMaxLength(350)
    )
    .addStringOption((o) =>
      o
        .setName("style")
        .setDescription("Remix style preset")
        .setRequired(false)
        .addChoices(...styleChoices.slice(0, 25))
    )
    .addStringOption((o) =>
      o
        .setName("inspiration_pack")
        .setDescription("Rust logo trend direction")
        .setRequired(false)
        .addChoices(...rustInspirationChoices)
    )
    .addStringOption((o) =>
      o
        .setName("colors")
        .setDescription("Comma-separated HEX colors (max 8)")
        .setRequired(false)
        .setMaxLength(80)
    )
    .addStringOption((o) => o.setName("font").setDescription("Font direction").setRequired(false).setMaxLength(120))
    .addBooleanOption((o) => o.setName("glow").setDescription("Enable glow").setRequired(false))
    .addStringOption((o) =>
      o.setName("negative_prompt").setDescription("What to avoid").setRequired(false).setMaxLength(200)
    );
}

function createReferenceCommand() {
  return new SlashCommandBuilder()
    .setName("reference")
    .setDescription("Manage your saved image references")
    .addSubcommand((s) =>
      s
        .setName("add")
        .setDescription("Save a reference image for future logo generations")
        .addAttachmentOption((o) => o.setName("image").setDescription("Reference image").setRequired(true))
    )
    .addSubcommand((s) => s.setName("list").setDescription("List your saved references"))
    .addSubcommand((s) => s.setName("clear").setDescription("Clear all saved references"))
    .addSubcommand((s) =>
      s
        .setName("remove")
        .setDescription("Remove one saved reference by index")
        .addIntegerOption((o) => o.setName("index").setDescription("Index from /reference list").setRequired(true))
    );
}

function createPromptPreviewCommand() {
  return new SlashCommandBuilder()
    .setName("prompt-preview")
    .setDescription("Preview the final AI prompt without generating an image")
    .addStringOption((o) =>
      o.setName("description").setDescription("Logo concept description").setRequired(true).setMaxLength(500)
    )
    .addStringOption((o) =>
      o
        .setName("style")
        .setDescription("Style preset")
        .setRequired(false)
        .addChoices(...styleChoices.slice(0, 25))
    )
    .addStringOption((o) =>
      o
        .setName("inspiration_pack")
        .setDescription("Rust logo trend direction")
        .setRequired(false)
        .addChoices(...rustInspirationChoices)
    )
    .addStringOption((o) =>
      o.setName("custom_style").setDescription("Custom style override").setRequired(false).setMaxLength(200)
    )
    .addStringOption((o) =>
      o.setName("colors").setDescription("Comma-separated HEX colors (max 8)").setRequired(false).setMaxLength(80)
    )
    .addStringOption((o) => o.setName("font").setDescription("Font direction").setRequired(false).setMaxLength(120))
    .addBooleanOption((o) => o.setName("glow").setDescription("Enable glow").setRequired(false));
}

export const commandData = [
  createLogoCommand(),
  createLogoAdvancedCommand(),
  createStylesCommand(),
  createInspirationCommand(),
  createRemixCommand(),
  createReferenceCommand(),
  createPromptPreviewCommand()
].map((c) => c.toJSON());

export function getCommandHealthSnapshot() {
  return {
    success: commandHealth.success,
    errors: commandHealth.errors,
    lastError: commandHealth.lastError,
    lastErrorAt: commandHealth.lastErrorAt
  };
}

async function handleLogoLike(interaction, advanced = false) {
  const options = interaction.options;
  const includeSavedRefs = options.getBoolean("include_saved_refs") ?? true;
  const savedRefs = includeSavedRefs ? listReferences(interaction.user.id, interaction.guildId) : [];

  const description = cleanText(options.getString("description"), 500);
  const style = options.getString("style") || undefined;
  const inspirationPack = options.getString("inspiration_pack") || undefined;
  const customStyle = cleanText(options.getString("custom_style"), 200) || undefined;
  const colors = parseColors(options.getString("colors") || "");
  const font = cleanText(options.getString("font"), 120) || undefined;
  const glow = options.getBoolean("glow") ?? false;
  const text = cleanText(options.getString("text"), 64) || undefined;
  const mascot = cleanText(options.getString("mascot"), 120) || undefined;
  const vibe = cleanText(options.getString("vibe"), 120) || undefined;
  const complexity = options.getString("complexity") || undefined;
  const iconFocus = options.getString("icon_focus") || undefined;
  const aspectRatio = options.getString("aspect_ratio") || undefined;
  const negativePrompt = cleanText(options.getString("negative_prompt"), 200) || undefined;
  const refs = collectAttachmentOptions(options);

  await interaction.deferReply();

  const advancedBits = advanced
    ? [
        options.getString("texture") ? `texture: ${options.getString("texture")}` : null,
        options.getString("emblem_shape") ? `emblem shape: ${options.getString("emblem_shape")}` : null,
        options.getInteger("shadow_strength") !== null
          ? `shadow strength: ${options.getInteger("shadow_strength")}/100`
          : null,
        options.getString("typography_case") ? `typography case: ${options.getString("typography_case")}` : null,
        options.getString("saturation") ? `saturation: ${options.getString("saturation")}` : null
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const prompt = buildLogoPrompt({
    description: advancedBits ? `${description}. Advanced controls: ${advancedBits}.` : description,
    style,
    inspiration: getInspirationPack(inspirationPack)?.guidance,
    customStyle,
    colors,
    font,
    glow,
    text,
    mascot,
    vibe,
    complexity,
    iconFocus: aspectRatio ? `${iconFocus || "emblem"} | target ratio: ${aspectRatio}` : iconFocus,
    negativePrompt
  });

  const preparedRefs = await prepareReferenceImages(refs, savedRefs);
  const result = await generateImageWithGemini({
    prompt,
    referenceImages: preparedRefs
  });

  const extension = mimeToExtension(result.mimeType);
  const file = new AttachmentBuilder(result.buffer, {
    name: `rust-logo-${Date.now()}.${extension}`
  });

  const embed = new EmbedBuilder()
    .setTitle(advanced ? "Rust Logo Generated (Advanced)" : "Rust Logo Generated")
    .setDescription(
      [
        `**Style:** ${style || customStyle || "default"}`,
        `**Colors:** ${colors.length ? colors.join(", ") : "auto"}`,
        `**Glow:** ${glow ? "on" : "off"}`,
        `**References used:** ${preparedRefs.length}`
      ].join("\n")
    )
    .setImage(`attachment://${file.name}`);

  await interaction.editReply({
    embeds: [embed],
    files: [file]
  });
}

async function handleRemix(interaction) {
  const options = interaction.options;
  const source = options.getAttachment("source_image");
  const description = cleanText(options.getString("description"), 350);

  const style = options.getString("style") || undefined;
  const inspirationPack = options.getString("inspiration_pack") || undefined;
  const colors = parseColors(options.getString("colors") || "");
  const font = cleanText(options.getString("font"), 120) || undefined;
  const glow = options.getBoolean("glow") ?? false;
  const negativePrompt = cleanText(options.getString("negative_prompt"), 200) || undefined;

  await interaction.deferReply();

  const prompt = buildRemixPrompt({
    description,
    style,
    inspiration: getInspirationPack(inspirationPack)?.guidance,
    colors,
    font,
    glow,
    negativePrompt
  });

  const preparedRefs = await prepareReferenceImages([
    {
      url: source.url,
      contentType: source.contentType || "image/png"
    }
  ]);

  const result = await generateImageWithGemini({
    prompt,
    referenceImages: preparedRefs
  });

  const extension = mimeToExtension(result.mimeType);
  const file = new AttachmentBuilder(result.buffer, {
    name: `rust-remix-${Date.now()}.${extension}`
  });

  const embed = new EmbedBuilder()
    .setTitle("Rust Logo Remix")
    .setDescription(`Remix complete. Style: ${style || "auto"}`)
    .setImage(`attachment://${file.name}`);

  await interaction.editReply({ embeds: [embed], files: [file] });
}

async function handleReference(interaction) {
  const sub = interaction.options.getSubcommand();
  const userId = interaction.user.id;
  const guildId = interaction.guildId;

  if (sub === "add") {
    const image = interaction.options.getAttachment("image");
    const updated = addReference(userId, guildId, image.url);
    await interaction.reply({
      content: `Saved. You now have ${updated.length} reference image(s).`,
      ephemeral: true
    });
    return;
  }

  if (sub === "list") {
    const refs = listReferences(userId, guildId);
    if (!refs.length) {
      await interaction.reply({ content: "No saved references yet.", ephemeral: true });
      return;
    }

    const lines = refs.map((url, index) => `${index + 1}. ${url}`);
    await interaction.reply({
      content: `Saved references:\n${lines.join("\n")}`,
      ephemeral: true
    });
    return;
  }

  if (sub === "remove") {
    const index = interaction.options.getInteger("index", true);
    const refs = removeReference(userId, guildId, index);

    if (refs === null) {
      await interaction.reply({
        content: "Invalid index. Use /reference list first.",
        ephemeral: true
      });
      return;
    }

    await interaction.reply({
      content: `Removed. ${refs.length} reference(s) remaining.`,
      ephemeral: true
    });
    return;
  }

  clearReferences(userId, guildId);
  await interaction.reply({
    content: "All saved references cleared.",
    ephemeral: true
  });
}

async function handleStyles(interaction) {
  const lines = stylePresets.map((preset) => `• **${preset.name}** — ${preset.description}`);
  const embed = new EmbedBuilder()
    .setTitle("Recommended Rust Logo Styles")
    .setDescription(lines.join("\n"))
    .setFooter({ text: "Use /logo style:<preset> and optional custom_style" });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleInspiration(interaction) {
  const lines = rustInspirationPacks.map(
    (pack) => `• **${pack.name}** (${pack.key}) — ${pack.guidance}`
  );

  const embed = new EmbedBuilder()
    .setTitle("Rust Inspiration Packs")
    .setDescription(lines.join("\n"))
    .setFooter({
      text: "These are trend-inspired directions from common Rust branding motifs, not copied logos."
    });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handlePromptPreview(interaction) {
  const description = cleanText(interaction.options.getString("description"), 500);
  const style = interaction.options.getString("style") || undefined;
  const inspirationPack = interaction.options.getString("inspiration_pack") || undefined;
  const customStyle = cleanText(interaction.options.getString("custom_style"), 200) || undefined;
  const colors = parseColors(interaction.options.getString("colors") || "");
  const font = cleanText(interaction.options.getString("font"), 120) || undefined;
  const glow = interaction.options.getBoolean("glow") ?? false;

  const prompt = buildLogoPrompt({
    description,
    style,
    inspiration: getInspirationPack(inspirationPack)?.guidance,
    customStyle,
    colors,
    font,
    glow
  });

  await interaction.reply({
    content: `Prompt preview:\n\n${prompt.slice(0, 1800)}`,
    ephemeral: true
  });
}

export async function handleInteraction(interaction) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  try {
    if (interaction.commandName === "logo") {
      await handleLogoLike(interaction, false);
      commandHealth.success += 1;
      return;
    }

    if (interaction.commandName === "logo-advanced") {
      await handleLogoLike(interaction, true);
      commandHealth.success += 1;
      return;
    }

    if (interaction.commandName === "styles") {
      await handleStyles(interaction);
      commandHealth.success += 1;
      return;
    }

    if (interaction.commandName === "inspiration") {
      await handleInspiration(interaction);
      commandHealth.success += 1;
      return;
    }

    if (interaction.commandName === "remix") {
      await handleRemix(interaction);
      commandHealth.success += 1;
      return;
    }

    if (interaction.commandName === "reference") {
      await handleReference(interaction);
      commandHealth.success += 1;
      return;
    }

    if (interaction.commandName === "prompt-preview") {
      await handlePromptPreview(interaction);
      commandHealth.success += 1;
    }
  } catch (error) {
    commandHealth.errors += 1;
    commandHealth.lastError = error?.message || "Unknown issue";
    commandHealth.lastErrorAt = new Date().toISOString();

    const content = `Error: ${error.message || "Unknown issue"}`;

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content });
    } else {
      await interaction.reply({ content, ephemeral: true });
    }
  }
}