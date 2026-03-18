const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const errorMiddleware = require("./middlewares/error.middleware");
const passport = require("passport");
require("./modules/auth/strategies/google.strategy");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { globalLimiter } = require("./config/rateLimit");

const expressWinston = require("express-winston");
const logger = require("./utils/logger");

const apiRoutes = require("./routes");

const app = express();

app.use(globalLimiter);
app.use(passport.initialize());
app.use(cors());
// app.use(morgan("dev"));
app.use(expressWinston.logger({
  winstonInstance: logger,
}));
// app.use(
//   expressWinston.logger({
//     winstonInstance: logger,
//     meta: false, // removes huge meta object
//     msg: "{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
//     expressFormat: false,
//     colorize: true,
//   })
// );
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Main API prefix
app.set("trust proxy", 1);
app.use("/api", apiRoutes);

// Error middleware (always last)
app.use(errorMiddleware);

module.exports = app;
