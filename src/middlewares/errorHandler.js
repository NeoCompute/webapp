const { AppError } = require("../errors/customErrors");
const { ValidationError } = require("sequelize");

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError && err.isOperational) {
    console.error("Operational Error: ", err.message);
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof ValidationError) {
    console.error("Validation Error: ", err.errors);
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      status: "error",
      message: "Validation error: ",
      errors: messages,
    });
  }

  console.error("Unexpected Error:", err);
  return res.status(500).json({
    status: "error",
    message: err.message || "Something went wrong",
  });
};

module.exports = errorHandler;
