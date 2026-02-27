export const rustInspirationPacks = [
  {
    key: "survival-faction",
    name: "Survival Faction",
    guidance:
      "Faction-like crest, radioactivity hints, scavenger symbolism, rugged survival hierarchy feeling"
  },
  {
    key: "industrial-outpost",
    name: "Industrial Outpost",
    guidance:
      "Outpost/compound mood, steel geometry, riveted framing, utilitarian construction marks"
  },
  {
    key: "elite-pvp",
    name: "Elite PvP Team",
    guidance:
      "Competitive esports energy, high readability, aggressive silhouette, icon-first identity"
  },
  {
    key: "raider-tribal",
    name: "Raider Tribal",
    guidance:
      "Raid culture attitude, tactical masks/helmets, chaotic confidence, rough-edged insignia"
  },
  {
    key: "minimal-hardcore",
    name: "Minimal Hardcore",
    guidance:
      "Simple hard-edged mark, minimal color usage, clear shape recognition at small sizes"
  }
];

export const rustInspirationChoices = rustInspirationPacks.map((pack) => ({
  name: pack.name,
  value: pack.key
}));

export function getInspirationPack(key) {
  return rustInspirationPacks.find((pack) => pack.key === key) || null;
}
