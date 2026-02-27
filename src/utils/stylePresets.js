export const stylePresets = [
  {
    name: "Single/Multiple Letter",
    key: "single-multiple-letter",
    description: "Lettermark logo using first letter(s) of each prominent word in the brand/team name.",
    promptSeed:
      "lettermark logo, use initials from team/server name, first letter of each prominent word, clean silhouette, high readability"
  },
  {
    name: "1 Letter",
    key: "one-letter",
    description:
      "Primary logo based on one dominant initial, or key initials from prominent words when requested.",
    promptSeed:
      "single dominant initial logo, strong iconic typography, optionally include first letters of prominent words, bold esports mark"
  },
  {
    name: "Player Gun Logo",
    key: "player-gun-logo",
    description: "Patch-inspired tactical insignia with sharp iconography and strong linework.",
    promptSeed:
      "Rust player aiming gun, AK47 kit look, full metal kit armor vibe, esports mascot composition, brand name in front of or behind character"
  },
  {
    name: "Neon",
    key: "neon",
    description: "High-intensity neon logo with glowing edges and energetic electric lighting.",
    promptSeed:
      "heavy neon glow, energetic saber-like edge light streaks, dark backdrop, electric accents, high contrast"
  },
  {
    name: "Modern",
    key: "modern",
    description: "Clean modern esports branding with strong geometry and polished finishing.",
    promptSeed:
      "modern esports logo, clean geometric composition, sharp edges, contemporary typography, premium finish"
  },
  {
    name: "Rust Server Logo",
    key: "rust-server-logo",
    description:
      "Server-brand style inspired by top Rust server ecosystems: bold, readable, competitive, and polished.",
    promptSeed:
      "premium Rust server branding style, high readability, mascot/emblem hybrid, bold icon with strong text lockup, polished competitive look"
  },
  {
    name: "Grunge",
    key: "grunge",
    description: "Scratchy vintage feel with dull palettes, rough textures, and mostly monochrome elements.",
    promptSeed:
      "grunge distressed logo, scratch texture, dull desaturated colors, mostly monochrome elements, gritty worn print finish"
  },
  {
    name: "Military Tactical",
    key: "military-tactical",
    description: "Tactical insignia with unit-patch composition and strong linework.",
    promptSeed: "tactical unit patch logo, military badge composition, strong lines, restrained palette"
  },
  {
    name: "Mascot Aggro",
    key: "mascot-aggro",
    description: "Aggressive mascot logo with heavy outlines and competitive energy.",
    promptSeed: "aggressive mascot logo, expressive face, thick outlines, high-impact composition"
  },
  {
    name: "Industrial Steel",
    key: "industrial-steel",
    description: "Heavy industrial icon inspired by Rust metal structures and compounds.",
    promptSeed: "industrial steel insignia, riveted metal feel, structural silhouette, robust typography"
  },
  {
    name: "Apocalyptic Clan Emblem",
    key: "apocalyptic-clan",
    description: "Aggressive emblem style with battle-worn textures and survival-war tone.",
    promptSeed: "apocalyptic survival emblem, gritty texture, high contrast, battle-worn steel, rusted metal accents"
  },
  {
    name: "Totem Animal",
    key: "totem-animal",
    description: "Animal totem crest tuned for clan identity and quick recognition.",
    promptSeed: "totemic animal emblem, symmetric badge, iconic silhouette, esports-ready"
  },
  {
    name: "Skull Raider",
    key: "skull-raider",
    description: "Popular Rust raider aesthetic with skull-centric aggressive iconography.",
    promptSeed: "raider skull mascot emblem, intimidating expression, rough battle texture, hard-edged silhouette"
  },
  {
    name: "Bandit Outpost Badge",
    key: "bandit-outpost-badge",
    description: "Badge/crest identity with outlaw-survival atmosphere and emblem structure.",
    promptSeed: "outpost badge logo, outlaw survival tone, emblem framing, rugged texture, clear center icon"
  },
  {
    name: "Minimal Monogram",
    key: "minimal-monogram",
    description: "Clean initials-first logo for teams preferring simplicity and clarity.",
    promptSeed: "minimal geometric monogram, clean vector edges, esports-ready silhouette"
  },
  {
    name: "Neon Futuristic",
    key: "neon-futuristic",
    description: "Cyber-futuristic neon style with angular forms and glowing highlights.",
    promptSeed: "futuristic esports logo, neon rim light, dark backdrop, sharp angular symbol"
  },
  {
    name: "Vintage Raider",
    key: "vintage-raider",
    description: "Retro raider badge style with weathered stamp-like finish.",
    promptSeed: "vintage raider crest, weathered print texture, old badge proportions"
  }
];

export const styleChoices = stylePresets.map((preset) => ({
  name: preset.name,
  value: preset.key
}));

export function getStylePresetByKey(key) {
  return stylePresets.find((preset) => preset.key === key) || null;
}
