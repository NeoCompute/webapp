const StatsD = require("hot-shots");

const statsd = new StatsD({
  host: "127.0.0.1", // Adjust if using a remote StatsD server or AWS CloudWatch Agent with StatsD
  port: 8125, // Standard StatsD port
  prefix: "webapp.",
});

module.exports = statsd;
