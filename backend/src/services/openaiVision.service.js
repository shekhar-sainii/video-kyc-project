const fs = require("fs/promises");
const path = require("path");
const {
  OPENAI_API_KEY,
  OPENAI_VISION_MODEL,
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_DEPLOYMENT_NAME,
  AZURE_OPENAI_API_VERSION,
} = require("../config/env");

const DEFAULT_MODEL = OPENAI_VISION_MODEL || "gpt-4-vision-preview";

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
};

const toDataUrl = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const mimeType = getMimeType(filePath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

const stripJsonFences = (value) =>
  value
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

const parseJsonResponse = (text) => {
  const cleaned = stripJsonFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("OpenAI response did not contain valid JSON");
    }
    return JSON.parse(match[0]);
  }
};

const isOpenAIVisionConfigured = () => Boolean(OPENAI_API_KEY || AZURE_OPENAI_API_KEY);

const requestVisionJson = async ({ prompt, imagePaths, maxOutputTokens = 300 }) => {
  const isAzure = Boolean(AZURE_OPENAI_API_KEY);
  const isStandard = Boolean(OPENAI_API_KEY);

  if (!isAzure && !isStandard) {
    const error = new Error("OpenAI vision is not configured");
    error.statusCode = 500;
    throw error;
  }

  const imageInputs = await Promise.all(
    imagePaths.map(async (imagePath) => ({
      type: "image_url",
      image_url: { url: await toDataUrl(imagePath) },
    }))
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    let url;
    let headers = { "Content-Type": "application/json" };
    let body;

    if (isAzure) {
      const endpoint = AZURE_OPENAI_ENDPOINT.replace(/\/$/, "");
      url = `${endpoint}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;
      headers["api-key"] = AZURE_OPENAI_API_KEY;
      body = {
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: prompt }, ...imageInputs],
          },
        ],
        max_completion_tokens: maxOutputTokens,
      };
    } else {
      url = "https://api.openai.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${OPENAI_API_KEY}`;
      body = {
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: prompt }, ...imageInputs],
          },
        ],
        max_tokens: maxOutputTokens,
        temperature: 0.1,
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = await response.json();

    if (!response.ok) {
      const error = new Error(
        payload?.error?.message || `OpenAI request failed with status ${response.status}`
      );
      error.statusCode = response.status || 500;
      throw error;
    }

    const outputText = payload.choices?.[0]?.message?.content || "";
    return parseJsonResponse(outputText);
  } finally {
    clearTimeout(timeout);
  }
};

const compareFacesWithOpenAI = async (referenceImagePath, liveImagePath) => {
  const result = await requestVisionJson({
    prompt: [
      "You are verifying a fintech KYC session.",
      "Compare these two face images: the first is the submitted reference photo, the second is the live selfie from video KYC.",
      "Return JSON only with this exact shape:",
      '{"matched": true, "score": 0.0, "reason": "short reason"}',
      "Rules:",
      "- score must be a number from 0 to 1",
      "- matched must be true only if both images very likely show the same person",
      "- if the images are unclear, set matched to false",
      "- do not include markdown or extra text",
    ].join(" "),
    imagePaths: [referenceImagePath, liveImagePath],
  });

  return {
    matched: Boolean(result?.matched),
    score: Number(result?.score || 0),
    reason: result?.reason || null,
    provider: "openai",
  };
};

const extractPanNumberWithOpenAI = async (panCardImagePath) => {
  const result = await requestVisionJson({
    prompt: [
      "Read the Indian PAN card image carefully.",
      "Extract only the PAN number if and only if every character is clearly visible.",
      "Return JSON only with this exact shape:",
      '{"pan": "ABCDE1234F"}',
      'If the PAN number is not clear enough to read confidently, return {"pan": null}.',
      "Do not infer, estimate, or guess missing characters.",
      "If there is glare, blur, low light, cropped text, or uncertain characters, return null.",
      "Do not return any other text.",
    ].join(" "),
    imagePaths: [panCardImagePath],
  });

  const pan = typeof result?.pan === "string" ? result.pan.trim().toUpperCase() : null;
  return pan || null;
};

module.exports = {
  isOpenAIVisionConfigured,
  compareFacesWithOpenAI,
  extractPanNumberWithOpenAI,
};
