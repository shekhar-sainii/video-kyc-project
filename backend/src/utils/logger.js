const { createLogger, format, transports } = require("winston");

const isDev = process.env.NODE_ENV !== "production";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    // Console (Pretty for Dev)
    new transports.Console({
      format: isDev
        ? format.combine(
            format.colorize(),
            format.printf(({ timestamp, level, message, stack }) => {
              return stack
                ? `${timestamp} ${level}: ${message}\n${stack}`
                : `${timestamp} ${level}: ${message}`;
            })
          )
        : format.json(),
    }),

    // Error file
    new transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    // Combined file
    new transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

module.exports = logger;