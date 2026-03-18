const Tesseract = require("tesseract.js");

const extractPanNumber = async (imagePath) => {
  if (!imagePath) {
    throw new Error("PAN image missing");
  }

  const result = await Tesseract.recognize(imagePath, "eng");

  const text = result.data.text;

  const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;

  const match = text.match(panRegex);

  return match ? match[0] : null;
};

module.exports = {
  extractPanNumber,
};