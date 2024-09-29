const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/tokenGenerator");

const createUser = async (userData) => {
  const { password, ...rest } = userData;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const token = generateToken();

  const newUser = await userRepository.createUser({
    ...rest,
    password: hashedPassword,
    token,
  });

  return newUser;
};

const updateUser = async (userId, updates) => {
  if (updates.password) {
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(updates.password, salt);
  }
  updates.account_updated = new Date();
  return await userRepository.updateUser(userId, updates);
};

module.exports = {
  createUser,
  updateUser,
};
