const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
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
  console.error(
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
  logging: false, // Disable logging; true for debugging
});

const testDbConnection = async () => {
  try {
    await dbConnection.authenticate();
    console.log("Connection has been established successfully.");
    return true;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return false;
  }
};

const syncDbConnection = async () => {
  try {
    await dbConnection.sync();
    console.log("Database tables have been created successfully.");
    return true;
  } catch (error) {
    console.error("Error syncing database tables:", error);
    return false;
  }
};

module.exports = {
  dbConnection,
  testDbConnection,
  syncDbConnection,
};
