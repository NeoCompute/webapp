const app = require("./app");
const {
  testDbConnection,
  syncDbConnection,
} = require("../src/databases/postgresDbConnection");

const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");

const startServer = async () => {
  try {
    await testDbConnection();
    console.log("Database connection established successfully.");

    await syncDbConnection();
    console.log("Database synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
