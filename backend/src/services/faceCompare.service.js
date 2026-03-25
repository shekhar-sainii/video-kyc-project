const path = require("path");
const canvas = require("canvas");
const logger = require("../utils/logger");
const {
  isOpenAIVisionConfigured,
  compareFacesWithOpenAI,
} = require("./openaiVision.service");
const { StatusCodes } = require("http-status-codes")

const { Canvas, Image, ImageData, createCanvas, loadImage } = canvas;

const MODELS_DIR = path.join(__dirname, "..", "models");
const FACE_MATCH_THRESHOLD = 0.5;
const FALLBACK_SAMPLE_SIZE = 128;
const FALLBACK_MATCH_THRESHOLD = 0.9;
const NODE_MAJOR_VERSION = Number(process.versions.node.split(".")[0] || 0);
const ADVANCED_FACE_MATCH_SUPPORTED = NODE_MAJOR_VERSION > 0 && NODE_MAJOR_VERSION < 24;

let faceApiPromise = null;
let modelsReadyPromise = null;
let advancedFaceWarningShown = false;

const logAdvancedFaceUnavailable = (reason) => {
  if (advancedFaceWarningShown) {
    return;
  }

  advancedFaceWarningShown = true;
  logger.warn({
    message: "Advanced face comparison disabled; using fallback matcher",
    reason,
    nodeVersion: process.versions.node,
  });
};

const getFaceApi = async () => {
  if (!ADVANCED_FACE_MATCH_SUPPORTED) {
    logAdvancedFaceUnavailable("Current Node.js runtime is not supported by the TensorFlow face stack");
    throw new Error("Advanced face comparison is disabled in this runtime");
  }

  if (!faceApiPromise) {
    faceApiPromise = import("@vladmandic/face-api/dist/face-api.esm-nobundle.js")
      .then((mod) => mod.default || mod)
      .catch((error) => {
        faceApiPromise = null;
        throw error;
      });
  }

  const faceapi = await faceApiPromise;
  faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
  return faceapi;
};

const ensureModelsLoaded = async () => {
  if (!modelsReadyPromise) {
    modelsReadyPromise = (async () => {
      const faceapi = await getFaceApi();
      await faceapi.tf.ready();
      await faceapi.tf.setBackend("cpu");

      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_DIR),
        faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_DIR),
        faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_DIR),
      ]);
    })().catch((error) => {
      modelsReadyPromise = null;
      throw error;
    });
  }

  await modelsReadyPromise;
};

const createDescriptor = async (imagePath) => {
  await ensureModelsLoaded();
  const faceapi = await getFaceApi();

  let image;
  try {
    image = await loadImage(imagePath);
  } catch (error) {
    logger.error({
      message: "Unable to load face image",
      imagePath,
      error: error.message,
      stack: error.stack,
    });

    const wrappedError = new Error("Unable to read one of the face images.");
    wrappedError.statusCode = StatusCodes.BAD_REQUEST;
    throw wrappedError;
  }

  const workCanvas = createCanvas(image.width, image.height);
  const ctx = workCanvas.getContext("2d");
  ctx.drawImage(image, 0, 0, image.width, image.height);

  const detection = await faceapi
    .detectSingleFace(workCanvas)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    const error = new Error("Face could not be detected clearly in one of the images.");
    error.statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
    throw error;
  }

  return detection.descriptor;
};

const compareFaces = async (img1, img2) => {
  /*
  if (isOpenAIVisionConfigured()) {
    try {
      const result = await compareFacesWithOpenAI(img1, img2);

      logger.info({
        message: "Face comparison completed via OpenAI vision",
        img1,
        img2,
        matched: result.matched,
        score: result.score,
      });

      return result;
    } catch (error) {
      logger.error({
        message: "OpenAI face comparison failed, using local fallback matcher",
        img1,
        img2,
        error: error.message,
        stack: error.stack,
      });
    }
  }
  */

  try {
    const faceapi = await getFaceApi();
    const [descriptor1, descriptor2] = await Promise.all([
      createDescriptor(img1),
      createDescriptor(img2),
    ]);

    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    const matched = distance <= FACE_MATCH_THRESHOLD;

    logger.info({
      message: "Face comparison completed",
      img1,
      img2,
      distance,
      threshold: FACE_MATCH_THRESHOLD,
      matched,
    });

    return {
      matched,
      score: Number(Math.max(0, 1 - distance).toFixed(4)),
      distance: Number(distance.toFixed(4)),
      threshold: FACE_MATCH_THRESHOLD,
      provider: "face-api",
    };
  } catch (error) {
    if (ADVANCED_FACE_MATCH_SUPPORTED) {
      logger.error({
        message: "Advanced face comparison failed, using fallback matcher",
        img1,
        img2,
        error: error.message,
        stack: error.stack,
      });
    } else {
      logAdvancedFaceUnavailable(error.message);
    }

    return compareFacesFallback(img1, img2);
  }
};

const getImageVector = async (imagePath) => {
  let image;
  try {
    image = await loadImage(imagePath);
  } catch (error) {
    const wrappedError = new Error("Unable to process one of the face images.");
    wrappedError.statusCode = StatusCodes.BAD_REQUEST;
    throw wrappedError;
  }

  const workCanvas = createCanvas(FALLBACK_SAMPLE_SIZE, FALLBACK_SAMPLE_SIZE);
  const ctx = workCanvas.getContext("2d");
  ctx.drawImage(image, 0, 0, FALLBACK_SAMPLE_SIZE, FALLBACK_SAMPLE_SIZE);

  const { data } = ctx.getImageData(0, 0, FALLBACK_SAMPLE_SIZE, FALLBACK_SAMPLE_SIZE);
  const vector = new Float32Array(FALLBACK_SAMPLE_SIZE * FALLBACK_SAMPLE_SIZE);

  for (let i = 0, pixel = 0; i < data.length; i += 4, pixel += 1) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    vector[pixel] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  return vector;
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

const compareFacesFallback = async (img1, img2) => {
  const [vector1, vector2] = await Promise.all([
    getImageVector(img1),
    getImageVector(img2),
  ]);

  const similarity = cosineSimilarity(vector1, vector2);
  const matched = similarity >= FALLBACK_MATCH_THRESHOLD;

  logger.warn({
    message: "Fallback face similarity computed",
    img1,
    img2,
    similarity,
    threshold: FALLBACK_MATCH_THRESHOLD,
    matched,
  });

  return {
    matched,
    score: Number(similarity.toFixed(4)),
    distance: null,
    threshold: FALLBACK_MATCH_THRESHOLD,
    mode: "fallback",
  };
};

module.exports = {
  compareFaces,
};
