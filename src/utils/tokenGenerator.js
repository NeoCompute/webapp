const crypto = require("crypto");

const generateToken = () => {
  return crypto.randomBytes(30).toString("hex");
};

module.exports = generateToken;
