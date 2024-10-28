const winston = require("winston");
require("winston-cloudwatch");
const dotenv = require("dotenv");
dotenv.config();

const {
  CLOUDWATCH_LOG_GROUP = "/aws/ec2/webappGroup",
  CLOUDWATCH_LOG_STREAM = "webapp/syslog",
  AWS_REGION = "us-east-1",
  ENVIRONMENT = "local",
} = process.env;

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  verbose: "cyan",
  debug: "blue",
  silly: "rainbow",
});

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ""
    }`;
  })
);

const transports = [];

if (ENVIRONMENT === "local") {
  transports.push(
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({ filename: "combined.log" })
  );
} else if (ENVIRONMENT === "production") {
  transports.push(
    new winston.transports.CloudWatch({
      logGroupName: CLOUDWATCH_LOG_GROUP,
      logStreamName: CLOUDWATCH_LOG_STREAM,
      awsRegion: AWS_REGION,
      jsonMessage: true,
    })
  );
}

const logger = winston.createLogger({
  level: "silly", // Log all levels
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Default JSON format for structured logging
  ),
  transports, // Use the transports array defined based on environment
});

module.exports = logger;
