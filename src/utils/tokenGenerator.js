const crypto = require("crypto");
const User = require("../models/user");

const generateToken = () => {
  return crypto.randomBytes(30).toString("hex");
};

const setVerificationToken = async (user) => {
  user.verificationToken = generateToken();
  user.verificationTokenExpiry = Date.now() + 2 * 60 * 1000;
  await user.save();
};

module.exports = { generateToken, setVerificationToken };
