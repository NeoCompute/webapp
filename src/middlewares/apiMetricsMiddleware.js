const statsd = require("../utils/statsdClient");

const apiMetricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const endpoint = req.route ? req.route.path : req.path;
  const method = req.method.toLowerCase();

  statsd.increment(`api.${method}_${endpoint.replace(/\//g, "_")}.count`);

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    statsd.timing(
      `api.${method}_${endpoint.replace(/\//g, "_")}.response_time`,
      duration
    );
  });

  next();
};

module.exports = apiMetricsMiddleware;
