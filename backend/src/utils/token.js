const crypto = require("crypto");

const generateRandomToken = (size = 40) => {
  return crypto.randomBytes(size).toString("hex");
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  generateRandomToken,
  hashToken,
};