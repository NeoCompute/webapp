const app = require("./app");
const {
  testDbConnection,
  syncDbConnection,
} = require("../src/databases/postgresDbConnection");
const dotenv = require("dotenv");
const logger = require("./utils/logger");

dotenv.config();

const PORT = process.env.PORT || 3000;
app.disable("x-powered-by");

const startServer = async () => {
  try {
    await testDbConnection();
    logger.info("Database connection established successfully.");

    await syncDbConnection();
    logger.info("Database synchronized successfully.");

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
