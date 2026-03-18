const canvas = require("canvas");
const logger = require("../utils/logger");

const { createCanvas, loadImage } = canvas;

const SAMPLE_SIZE = 128;
const MATCH_THRESHOLD = 0.9;

const getImageVector = async (imagePath) => {
  try {
    const img = await loadImage(imagePath);
    const workCanvas = createCanvas(SAMPLE_SIZE, SAMPLE_SIZE);
    const ctx = workCanvas.getContext("2d");

    ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

    const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const vector = new Float32Array(SAMPLE_SIZE * SAMPLE_SIZE);

    for (let i = 0, pixel = 0; i < data.length; i += 4, pixel += 1) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Convert to grayscale and normalize for simple similarity scoring.
      vector[pixel] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    return vector;
  } catch (error) {
    logger.error({
      message: "Image vector generation failed",
      imagePath,
      error: error.message,
      stack: error.stack,
    });

    const wrappedError = new Error("Unable to process one of the face images.");
    wrappedError.statusCode = 400;
    throw wrappedError;
  }
};

const cosineSimilarity = (vectorA, vectorB) => {
  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i += 1) {
    const a = vectorA[i];
    const b = vectorB[i];

    dot += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  }

  if (!magnitudeA || !magnitudeB) {
    return 0;
  }

  return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
};

const compareFaces = async (img1, img2) => {
  const vector1 = await getImageVector(img1);
  const vector2 = await getImageVector(img2);
  const similarity = cosineSimilarity(vector1, vector2);

  logger.info({
    message: "Fallback face similarity computed",
    similarity,
    img1,
    img2,
  });

  return similarity >= MATCH_THRESHOLD;
};

module.exports = {
  compareFaces,
};
