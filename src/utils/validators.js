const hexRegex = /^#?[0-9a-fA-F]{6}$/;

export function parseColors(input) {
  if (!input) {
    return [];
  }

  const colors = input
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean)
    .map((color) => (color.startsWith("#") ? color : `#${color}`));

  if (colors.length > 8) {
    throw new Error("You can provide up to 8 colors only.");
  }

  const invalid = colors.filter((color) => !hexRegex.test(color));
  if (invalid.length > 0) {
    throw new Error(`Invalid HEX colors: ${invalid.join(", ")}`);
  }

  return colors;
}

export function clampReferenceAttachments(attachments) {
  if (!attachments || attachments.length === 0) {
    return [];
  }

  return attachments.slice(0, 4);
}

export function cleanText(input, max = 500) {
  if (!input) {
    return "";
  }

  return String(input).replace(/\s+/g, " ").trim().slice(0, max);
}
