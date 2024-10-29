const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const userRoutes = require("./routes/userRoutes");
const profilePictureRoutes = require("./routes/profilePictureRoutes");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./utils/logger");
const apiMetricsMiddleware = require("./middlewares/metricsMiddleware");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to log each incoming request
app.use((req, res, next) => {
  logger.http(`Incoming request: ${req.method} ${req.url}`, {
    headers: req.headers,
    params: req.params,
    query: req.query,
  });
  next();
});

// Middleware to collect API metrics
app.use(apiMetricsMiddleware);

// Register routes
app.use("/healthz", healthRoutes);
app.use("/v1", userRoutes);
app.use("/v1", profilePictureRoutes);

// Handle undefined routes
app.use((req, res) => {
  logger.warn(`Undefined route accessed: ${req.method} ${req.url}`);
  res.status(404).end();
});

app.use(errorHandler);

module.exports = app;
