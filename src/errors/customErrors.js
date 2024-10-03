// customErrors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Mark this as an operational error
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class ValidateError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400);
  }
}

class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class DatabaseError extends AppError {
  constructor(message = "Database error") {
    super(message, 500);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidateError,
  AuthError,
  DatabaseError,
};
