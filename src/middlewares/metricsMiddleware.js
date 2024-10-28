const statsd = require("../utils/statsdClient");

const apiMetricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const endpoint = req.route ? req.route.path : req.path;

  // Count the API call
  statsd.increment(`api.${endpoint}.count`);

  // Measure the response time
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    statsd.timing(`api.${endpoint}.response_time`, duration);
  });

  next();
};

module.exports = apiMetricsMiddleware;
