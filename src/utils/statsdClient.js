const StatsD = require("hot-shots");

const statsd = new StatsD({
  host: "127.0.0.1",
  port: 8125,
  prefix: "webapp.",
});

module.exports = statsd;
