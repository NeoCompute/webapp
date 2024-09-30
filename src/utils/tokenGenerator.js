const crypto = require("crypto");

const generateToken = () => {
  return crypto.randomBytes(30).toString("hex"); // Generates a secure random token
};

module.exports = generateToken;
