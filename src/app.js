const express = require("express");
const healthRoutes = require("./routes/healthRoutes");

const app = express();

// Middleware to parse JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register health check routes
app.use("/", healthRoutes);

// For undefined routes
app.use((req, res) => {
  res.status(404).send();
});

module.exports = app;
