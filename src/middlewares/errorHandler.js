const { AppError } = require("../errors/customErrors");
const { ValidationError } = require("sequelize");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError && err.isOperational) {
    logger.warn("Operational Error:", {
      message: err.message,
      statusCode: err.statusCode,
    });
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof ValidationError) {
    const messages = err.errors.map((e) => e.message);
    logger.warn("Validation Error:", { errors: messages });
    return res.status(400).json({
      status: "error",
      message: "Validation error:",
      errors: messages,
    });
  }

  logger.error("Unexpected Error:", { message: err.message, stack: err.stack });
  return res.status(500).json({
    status: "error",
    message: err.message || "Something went wrong",
  });
};

module.exports = errorHandler;
