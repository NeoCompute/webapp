const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware to parse JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use("/healthz", healthRoutes);
app.use("/v1", userRoutes);

// For undefined routes
app.use((req, res) => {
  res.status(404).end();
});

module.exports = app;
