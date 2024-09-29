const User = require("../models/user");
const crypto = require("crypto");

const createUser = async (userData) => {
  return await User.create(userData);
};

const findUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

const findUserById = async (id) => {
  return await User.findByPk(id);
};

const findUserByToken = async (token) => {
  return await User.findOne({ where: { apiToken: token } });
};

const updateUser = async (id, updateData) => {
  const user = await findUserById(id);
  if (!user) return null;
  return await user.update(updateData);
};

const generateApiToken = () => {
  return crypto.randomBytes(30).toString("hex");
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByToken,
  updateUser,
  generateApiToken,
};
