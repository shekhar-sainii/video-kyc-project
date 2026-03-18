const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "15m",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
};