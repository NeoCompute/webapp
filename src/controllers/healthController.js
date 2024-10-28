const db = require("../databases/postgresDbConnection");
const logger = require("../utils/logger");

const healthCheck = async (req, res) => {
  if (Object.keys(req.query).length > 0) {
    logger.warn("Invalid query parameters in health check request");
    return res.status(400).end();
  }
  const isDbConnected = await db.testDbConnection();
  logger.info("Database connection status checked", { isDbConnected });

  if (isDbConnected) {
    res.status(200).end();
  } else {
    res.status(503).end();
  }
};

module.exports = { healthCheck };
