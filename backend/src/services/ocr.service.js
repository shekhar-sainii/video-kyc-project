const Tesseract = require("tesseract.js");
const { createCanvas, loadImage } = require("canvas");
const {
  isOpenAIVisionConfigured,
  extractPanNumberWithOpenAI,
} = require("./openaiVision.service");

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const ALPHA_SUBSTITUTIONS = {
  "0": "O",
  "1": "I",
  "2": "Z",
  "4": "A",
  "5": "S",
  "6": "G",
  "7": "T",
  "8": "B",
};

const DIGIT_SUBSTITUTIONS = {
  O: "0",
  Q: "0",
  D: "0",
  U: "0",
  I: "1",
  L: "1",
  T: "1",
  Z: "2",
  A: "4",
  S: "5",
  G: "6",
  B: "8",
};

const OCR_CONFIGS = [
  {
    name: "pan-line",
    psm: Tesseract.PSM.SINGLE_LINE,
    whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  },
  {
    name: "single-block",
    psm: Tesseract.PSM.SINGLE_BLOCK,
    whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  },
];

const PREPROCESS_VARIANTS = [
  { name: "threshold-mid", threshold: 150, contrast: 1.2, sharpen: true },
  { name: "grayscale-boost", threshold: null, contrast: 1.45, sharpen: true },
];

const CROP_PASSES = [
  { name: "full-frame", widthRatio: 1, heightRatio: 1, offsetXRatio: 0, offsetYRatio: 0, scale: 2, fallback: false },
  { name: "pan-band-tight", widthRatio: 0.48, heightRatio: 0.12, offsetXRatio: -0.02, offsetYRatio: -0.02, scale: 5, fallback: true },
  { name: "pan-band-wide", widthRatio: 0.62, heightRatio: 0.16, offsetXRatio: -0.03, offsetYRatio: -0.01, scale: 4, fallback: true },
];

const CROP_WEIGHTS = {
  "full-frame": 8,
  "pan-band-tight": 5,
  "pan-band-wide": 4,
};

const OCR_WEIGHTS = {
  "pan-line": 5,
  "single-block": 3,
};

const SOURCE_WEIGHTS = {
  direct: 6,
  line: 4,
  merged: 1,
};

const getBestCandidate = (candidateScores) => {
  if (!candidateScores.size) {
    return null;
  }

  return [...candidateScores.values()]
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.hits - left.hits;
    })[0];
};

const normalizeAlphaChar = (char) => ALPHA_SUBSTITUTIONS[char] || char;
const normalizeDigitChar = (char) => DIGIT_SUBSTITUTIONS[char] || char;

const normalizePanWindow = (windowValue) => {
  if (!windowValue || windowValue.length !== 10) {
    return null;
  }

  const chars = windowValue.toUpperCase().split("");

  for (let index = 0; index < chars.length; index += 1) {
    if (index < 5 || index === 9) {
      chars[index] = normalizeAlphaChar(chars[index]);
    } else {
      chars[index] = normalizeDigitChar(chars[index]);
    }
  }

  const candidate = chars.join("");
  return PAN_REGEX.test(candidate) ? candidate : null;
};

const looksLikePanWindow = (windowValue) => {
  if (!windowValue || windowValue.length !== 10) {
    return false;
  }

  const chars = windowValue.toUpperCase().split("");
  const digitCount = chars.filter((char) => /[0-9]/.test(char)).length;
  const middleDigitCount = chars
    .slice(5, 9)
    .filter((char) => /[0-9]/.test(char)).length;
  const alphaCount = chars.filter((char) => /[A-Z]/.test(char)).length;

  return digitCount >= 3 && middleDigitCount >= 2 && alphaCount >= 5;
};

const extractPanFromToken = (token) => {
  const compact = token.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  const candidates = [];

  if (compact.length < 10) {
    return candidates;
  }

  for (let start = 0; start <= compact.length - 10; start += 1) {
    const rawWindow = compact.slice(start, start + 10);
    if (!looksLikePanWindow(rawWindow)) {
      continue;
    }

    const candidate = normalizePanWindow(rawWindow);
    if (candidate) {
      candidates.push(candidate);
    }
  }

  return [...new Set(candidates)];
};

const extractPanCandidatesFromText = (text) => {
  if (!text) {
    return [];
  }

  const upper = text.toUpperCase();
  const candidates = [];
  const seen = new Set();
  const addCandidates = (values, source) => {
    for (const value of values) {
      const key = `${source}:${value}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      candidates.push({ value, source });
    }
  };

  const lines = upper
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const sanitizedLine = line.replace(/[^A-Z0-9 ]/g, " ");
    const tokens = sanitizedLine
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 8 && token.length <= 14);

    for (const token of tokens) {
      addCandidates(extractPanFromToken(token), "direct");
    }

    const compactLine = sanitizedLine.replace(/\s+/g, "");
    if (compactLine.length >= 10 && compactLine.length <= 14) {
      addCandidates(extractPanFromToken(compactLine), "line");
    }
  }

  return candidates;
};

const applySharpen = (data, width, height) => {
  const original = new Uint8ClampedArray(data);
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0,
  ];

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      for (let channel = 0; channel < 3; channel += 1) {
        let value = 0;
        let kernelIndex = 0;

        for (let ky = -1; ky <= 1; ky += 1) {
          for (let kx = -1; kx <= 1; kx += 1) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + channel;
            value += original[idx] * kernel[kernelIndex];
            kernelIndex += 1;
          }
        }

        const targetIdx = (y * width + x) * 4 + channel;
        data[targetIdx] = Math.max(0, Math.min(255, value));
      }
    }
  }
};

const createProcessedBuffer = (image, crop, variant) => {
  const sourceWidth = image.width;
  const sourceHeight = image.height;
  const cropWidth = Math.round(sourceWidth * crop.widthRatio);
  const cropHeight = Math.round(sourceHeight * crop.heightRatio);
  const cropX = Math.max(
    0,
    Math.min(
      sourceWidth - cropWidth,
      Math.round((sourceWidth - cropWidth) / 2 + (sourceWidth * crop.offsetXRatio))
    )
  );
  const cropY = Math.max(
    0,
    Math.min(
      sourceHeight - cropHeight,
      Math.round((sourceHeight - cropHeight) / 2 + (sourceHeight * crop.offsetYRatio))
    )
  );

  const scale = crop.scale || 2;
  const canvas = createCanvas(
    Math.max(1, Math.round(cropWidth * scale)),
    Math.max(1, Math.round(cropHeight * scale))
  );
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const gray = (0.299 * data[index]) + (0.587 * data[index + 1]) + (0.114 * data[index + 2]);
    const contrasted = Math.max(0, Math.min(255, ((gray - 128) * variant.contrast) + 128));
    const output = variant.threshold === null
      ? contrasted
      : contrasted >= variant.threshold
        ? 255
        : 0;

    data[index] = output;
    data[index + 1] = output;
    data[index + 2] = output;
  }

  if (variant.sharpen) {
    applySharpen(data, canvas.width, canvas.height);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toBuffer("image/png");
};

const runOcr = async (imageInput, config) => {
  const result = await Tesseract.recognize(imageInput, "eng", {
    tessedit_pageseg_mode: config.psm,
    tessedit_char_whitelist: config.whitelist,
  });

  return result.data.text || "";
};

const extractPanNumber = async (imagePath) => {
  if (!imagePath) {
    throw new Error("PAN image missing");
  }

  const image = await loadImage(imagePath);
  const runPasses = async (crops) => {
    const candidateScores = new Map();

    for (const crop of crops) {
      for (const variant of PREPROCESS_VARIANTS) {
        const buffer = createProcessedBuffer(image, crop, variant);

        for (const config of OCR_CONFIGS) {
          const text = await runOcr(buffer, config);
          const candidates = extractPanCandidatesFromText(text);

          for (const candidate of candidates) {
            const key = candidate.value;
            const score =
              (CROP_WEIGHTS[crop.name] || 0) +
              (OCR_WEIGHTS[config.name] || 0) +
              (SOURCE_WEIGHTS[candidate.source] || 0);

            const current = candidateScores.get(key) || {
              value: key,
              score: 0,
              hits: 0,
            };

            current.score += score;
            current.hits += 1;
            candidateScores.set(key, current);
          }

          const bestCandidate = getBestCandidate(candidateScores);
          if (bestCandidate && bestCandidate.score >= 20 && bestCandidate.hits >= 2) {
            return bestCandidate.value;
          }
        }
      }
    }

    return getBestCandidate(candidateScores)?.value || null;
  };

  const focusedCrops = CROP_PASSES.filter((crop) => !crop.fallback);
  const focusedResult = await runPasses(focusedCrops);
  if (focusedResult) {
    return focusedResult;
  }

  const fallbackCrops = CROP_PASSES.filter((crop) => crop.fallback);
  const fallbackResult = await runPasses(fallbackCrops);
  if (fallbackResult) {
    return fallbackResult;
  }

  if (isOpenAIVisionConfigured()) {
    try {
      const openAiPan = await extractPanNumberWithOpenAI(imagePath);
      if (openAiPan && PAN_REGEX.test(openAiPan)) {
        return openAiPan;
      }
    } catch {
      // Ignore external OCR failures and surface null below.
    }
  }

  return null;
};

module.exports = {
  extractPanNumber,
};
