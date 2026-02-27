import { config } from "../config.js";

const FALLBACK_IMAGE_MODELS = [
  "gemini-3-pro-image-preview",
  "nano-banana-pro-preview",
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-preview-image-generation",
  "gemini-2.0-flash-exp-image-generation"
];

async function fetchAsBase64(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch reference image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

function buildImageParts(referenceImages = []) {
  return referenceImages.map((image) => ({
    inline_data: {
      mime_type: image.mimeType || "image/png",
      data: image.base64
    }
  }));
}

function extractImageFromGeminiResponse(json) {
  const candidates = json?.candidates || [];

  for (const candidate of candidates) {
    const parts = candidate?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return {
          mimeType: part.inlineData.mimeType || "image/png",
          data: part.inlineData.data
        };
      }

      if (part.inline_data?.data) {
        return {
          mimeType: part.inline_data.mime_type || "image/png",
          data: part.inline_data.data
        };
      }
    }
  }

  return null;
}

export async function prepareReferenceImages(attachments = [], urls = []) {
  const fromAttachments = attachments.map((attachment) => ({
    url: attachment.url,
    mimeType: attachment.contentType || "image/png"
  }));

  const fromUrls = urls.map((url) => ({
    url,
    mimeType: "image/png"
  }));

  const all = [...fromAttachments, ...fromUrls].slice(0, 8);

  const prepared = [];
  for (const image of all) {
    const base64 = await fetchAsBase64(image.url);
    prepared.push({
      mimeType: image.mimeType,
      base64
    });
  }

  return prepared;
}

export async function generateImageWithGemini({ prompt, referenceImages = [] }) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          ...buildImageParts(referenceImages)
        ]
      }
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      candidateCount: 1
    }
  };

  const attemptedModels = [];
  const modelsToTry = [
    config.geminiImageModel,
    ...FALLBACK_IMAGE_MODELS
  ].filter((model, index, all) => model && all.indexOf(model) === index);

  let lastError = null;

  for (const model of modelsToTry) {
    attemptedModels.push(model);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const json = await response.json();

    if (!response.ok) {
      const message = json?.error?.message || "Gemini generation failed.";
      const lower = message.toLowerCase();
      const isUnsupportedModel =
        lower.includes("not found") ||
        lower.includes("not supported") ||
        lower.includes("unsupported") ||
        lower.includes("permission");

      lastError = new Error(message);
      if (isUnsupportedModel) {
        continue;
      }

      throw lastError;
    }

    const image = extractImageFromGeminiResponse(json);
    if (!image) {
      throw new Error("Gemini response did not include an image. Try a different model in GEMINI_IMAGE_MODEL.");
    }

    return {
      buffer: Buffer.from(image.data, "base64"),
      mimeType: image.mimeType,
      raw: json
    };
  }

  throw new Error(
    `No compatible Gemini image model was available. Tried: ${attemptedModels.join(", ")}. Last error: ${lastError?.message || "Unknown error"}`
  );
}
