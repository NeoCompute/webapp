const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/tokenGenerator");

const createUser = async (userData) => {
  const { email, password, firstName, lastName } = userData;
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const token = generateToken();

  const newUser = await userRepository.createUser({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    token,
  });
  return newUser;
};

const updateUser = async (userId, updates) => {
  const allowedFields = ["firstName", "lastName", "password"];
  const updateKeys = Object.keys(updates);
  const invalidFields = updateKeys.filter(
    (key) => !allowedFields.includes(key)
  );

  if (invalidFields.length > 0) {
    throw new CustomError(
      `The following fields cannot be updated: ${invalidFields.join(", ")}`,
      400
    );
  }

  if (updates.password) {
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(updates.password, salt);
  }
  updates.account_updated = new Date();
  const updatedUser = await userRepository.updateUser(userId, updates);

  return updatedUser;
};

module.exports = {
  createUser,
  updateUser,
};
