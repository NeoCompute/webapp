const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const logger = require("../utils/logger");
const statsd = require("../utils/statsdClient");

dotenv.config();

// Destructure and assign environment variables with fallback defaults if necessary
const {
  DB_DATABASE,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_POOL_MAX,
  DB_POOL_MIN,
  DB_POOL_ACQUIRE,
  DB_POOL_IDLE,
} = process.env;

if (!DB_DATABASE || !DB_USER || !DB_PASSWORD || !DB_HOST) {
  logger.error(
    "Missing required environment variables for database connection."
  );
  process.exit(1);
}

const dbConnection = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10) || 5432,
  dialect: "postgres",
  pool: {
    max: parseInt(DB_POOL_MAX, 10) || 5,
    min: parseInt(DB_POOL_MIN, 10) || 0,
    acquire: parseInt(DB_POOL_ACQUIRE, 10) || 30000,
    idle: parseInt(DB_POOL_IDLE, 10) || 10000,
  },
  logging: (msg) => logger.debug(msg),
});

dbConnection.addHook("beforeExecute", (options) => {
  options.__startTime = Date.now();
});

dbConnection.addHook("afterExecute", (result, options) => {
  if (options.__startTime) {
    const duration = Date.now() - options.__startTime;
    statsd.timing("db.query.response_time", duration);
    logger.debug(`Query executed in ${duration} ms`);
  }
});

const testDbConnection = async () => {
  try {
    await dbConnection.authenticate();
    logger.info("Connection has been established successfully.");
    return true;
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
    return false;
  }
};

const syncDbConnection = async () => {
  try {
    await dbConnection.sync();
    logger.info("Database tables have been created successfully.");
    return true;
  } catch (error) {
    logger.error("Error syncing database tables:", error);
    return false;
  }
};

module.exports = {
  dbConnection,
  testDbConnection,
  syncDbConnection,
};
