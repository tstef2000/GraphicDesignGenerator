import { getStylePresetByKey } from "./stylePresets.js";

function joinList(items) {
  if (!items || items.length === 0) {
    return "not specified";
  }

  return items.join(", ");
}

export function buildLogoPrompt(input) {
  const preset = input.style ? getStylePresetByKey(input.style) : null;
  const isLettermarkStyle = ["single-multiple-letter", "one-letter", "minimal-monogram"].includes(
    input.style || ""
  );

  const sections = [
    "You are a senior esports and gaming brand designer.",
    "Generate ONE high-quality logo concept image for the game Rust (Facepunch survival game) team/server branding.",
    "Design must be original and avoid copying existing logos.",
    "Composition: centered logo, transparent or very dark neutral background, clean readable silhouette.",
    `Team/Server name text: ${input.text || "none"}`,
    `Core description: ${input.description}`,
    `Style preset: ${preset ? preset.name + " - " + preset.promptSeed : "custom/unspecified"}`,
    isLettermarkStyle
      ? "Lettermark rule: derive initials from the first letter of each prominent word in Team/Server name text."
      : "Lettermark rule: not required unless requested.",
    `Rust inspiration pack: ${input.inspiration || "none"}`,
    `Custom style: ${input.customStyle || "none"}`,
    `Color palette (HEX): ${joinList(input.colors)}`,
    `Font direction: ${input.font || "bold modern sans serif"}`,
    `Glow effect: ${input.glow ? "enabled" : "disabled"}`,
    `Mascot/subject: ${input.mascot || "none"}`,
    `Mood/vibe: ${input.vibe || "competitive, intimidating"}`,
    `Complexity: ${input.complexity || "balanced"}`,
    `Icon focus: ${input.iconFocus || "emblem"}`,
    `Negative constraints: ${input.negativePrompt || "no clutter, no watermarks, no low resolution artifacts"}`,
    "Rust-specific references to inspire visual language: radiation symbols, scrap metal textures, tactical insignias, outpost/industrial survival atmosphere.",
    "Output should look like a polished team logo suitable for Discord server icon and banner adaptations."
  ];

  return sections.join("\n");
}

export function buildRemixPrompt(input) {
  return [
    "You are refining an existing gaming logo for Rust team/server branding.",
    "Use the provided reference image as source inspiration while preserving recognizable identity.",
    `Requested adjustments: ${input.description}`,
    `Style direction: ${input.style || "keep current style with improvements"}`,
    `Rust inspiration pack: ${input.inspiration || "none"}`,
    `Color palette (HEX): ${joinList(input.colors)}`,
    `Font direction: ${input.font || "retain or improve readability"}`,
    `Glow effect: ${input.glow ? "enabled" : "disabled"}`,
    `Negative constraints: ${input.negativePrompt || "no blur, no watermark, no over-detail"}`,
    "Return one strong polished logo render."
  ].join("\n");
}
