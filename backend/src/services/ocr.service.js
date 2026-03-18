const Tesseract = require("tesseract.js");
const { createCanvas, loadImage } = require("canvas");

const PAN_REGEX = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;

const normalizePanCandidate = (value) =>
  value
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .replace(/0/g, "O");

const extractPanFromText = (text) => {
  const upper = text.toUpperCase();
  const directMatch = upper.match(PAN_REGEX);

  if (directMatch) {
    return directMatch[0];
  }

  const compact = normalizePanCandidate(upper);
  const candidateMatch = compact.match(/[A-Z]{5}[A-Z0-9]{4}[A-Z]/);

  if (!candidateMatch) {
    return null;
  }

  const chars = candidateMatch[0].split("");

  for (let i = 5; i <= 8; i += 1) {
    if (chars[i] === "O") {
      chars[i] = "0";
    }
  }

  const normalized = chars.join("");
  return PAN_REGEX.test(normalized) ? normalized : null;
};

const createProcessedBuffer = (image, crop) => {
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

  const canvas = createCanvas(cropWidth * 2, cropHeight * 2);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth * 2,
    cropHeight * 2
  );

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const gray = (0.299 * data[i]) + (0.587 * data[i + 1]) + (0.114 * data[i + 2]);
    const boosted = gray > 155 ? 255 : gray < 90 ? 0 : Math.min(255, gray * 1.15);

    data[i] = boosted;
    data[i + 1] = boosted;
    data[i + 2] = boosted;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toBuffer("image/png");
};

const runOcr = async (imageInput) => {
  const result = await Tesseract.recognize(imageInput, "eng", {
    tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  });

  return result.data.text || "";
};

const extractPanNumber = async (imagePath) => {
  if (!imagePath) {
    throw new Error("PAN image missing");
  }

  const image = await loadImage(imagePath);

  const passes = [
    { name: "center-tight", widthRatio: 0.66, heightRatio: 0.42, offsetXRatio: 0, offsetYRatio: 0 },
    { name: "center-wide", widthRatio: 0.78, heightRatio: 0.5, offsetXRatio: 0, offsetYRatio: 0 },
    { name: "upper-center", widthRatio: 0.78, heightRatio: 0.46, offsetXRatio: 0, offsetYRatio: -0.06 },
    { name: "full-frame", widthRatio: 1, heightRatio: 1, offsetXRatio: 0, offsetYRatio: 0 },
  ];

  for (const pass of passes) {
    const buffer = createProcessedBuffer(image, pass);
    const text = await runOcr(buffer);
    const extractedPan = extractPanFromText(text);

    if (extractedPan) {
      return extractedPan;
    }
  }

  return null;
};

module.exports = {
  extractPanNumber,
};
