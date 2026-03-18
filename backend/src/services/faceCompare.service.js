const faceapi = require("face-api.js");
const canvas = require("canvas");
const path = require("path");

const { Canvas, Image, ImageData, loadImage } = canvas;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

const loadModels = async () => {
  if (modelsLoaded) return;

  const modelPath = path.join(__dirname, "../models");

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);

  modelsLoaded = true;
};

const getFaceDescriptor = async (imagePath) => {
  await loadModels();

  const img = await loadImage(imagePath);

  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error("Face not detected");
  }

  return detection.descriptor;
};

const compareFaces = async (img1, img2) => {
  const descriptor1 = await getFaceDescriptor(img1);
  const descriptor2 = await getFaceDescriptor(img2);

  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);

  return distance < 0.45;
};

module.exports = {
  compareFaces,
};