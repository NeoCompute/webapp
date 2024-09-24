const app = require("./app");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 3000;

// disable x-powered-by to prevent exposing Express as Framework
app.disable("x-powered-by");

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
