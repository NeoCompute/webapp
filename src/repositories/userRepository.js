const User = require("../models/user");

const findByToken = async (token) => {
  return await User.findOne({ where: { token } });
};

const findByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

const updateUser = async (userId, updates) => {
  await User.update(updates, { where: { id: userId } });
  return await User.findByPk(userId);
};

const createUser = async (userData) => {
  return await User.create(userData);
};

module.exports = {
  findByToken,
  findByEmail,
  updateUser,
  createUser,
};
