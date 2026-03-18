const rateLimit = require("express-rate-limit");

// Global limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200, // max 200 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 login/register attempts
  message: {
    success: false,
    message: "Too many authentication attempts.",
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
};