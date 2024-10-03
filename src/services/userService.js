const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/tokenGenerator");
const { ValidationError } = require("sequelize");
const { DatabaseError, ValidateError } = require("../errors/customErrors");
const validatePassword = require("../utils/validatePassword");

const filterAllowedFields = (updates, allowedFields) => {
  return Object.keys(updates)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});
};

const createUser = async (userData) => {
  try {
    const { email, password, firstName, lastName } = userData;

    const passwordError = validatePassword(password);
    if (passwordError) {
      throw new ValidateError(passwordError);
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidateError("A user with this email already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const token = generateToken();
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1); // Token expiration set to 1 hour

    const newUser = await userRepository.createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      token,
      token_expiry: expirationTime,
    });

    return newUser;
  } catch (error) {
    console.error("Error in createUser:", error.message);
    if (error instanceof ValidationError || error instanceof ValidateError) {
      throw error;
    }
    throw new DatabaseError("Error creating user.");
  }
};

const updateUser = async (userId, updates) => {
  try {
    const allowedFields = ["firstName", "lastName", "password"];

    const updateKeys = Object.keys(updates);
    const invalidFields = updateKeys.filter(
      (key) => !allowedFields.includes(key)
    );

    if (updates.password) {
      const passwordError = validatePassword(updates.password);
      if (passwordError) {
        throw new ValidateError(passwordError);
      }
    }

    if (invalidFields.length > 0) {
      throw new ValidateError(
        `The following fields cannot be updated: ${invalidFields.join(", ")}`
      );
    }

    const filteredUpdates = filterAllowedFields(updates, allowedFields);

    if (filteredUpdates.password) {
      const salt = await bcrypt.genSalt(10);
      filteredUpdates.password = await bcrypt.hash(
        filteredUpdates.password,
        salt
      );
    }

    filteredUpdates.account_updated = new Date();

    const updatedUser = await userRepository.updateUser(
      userId,
      filteredUpdates
    );

    if (!updatedUser) {
      throw new ValidateError("User not found.");
    }

    return updatedUser;
  } catch (error) {
    console.error("Error in updateUser:", error); // Logging error
    if (error instanceof ValidationError || error instanceof ValidateError) {
      throw error;
    }
    throw new DatabaseError("Error updating user.");
  }
};

module.exports = {
  createUser,
  updateUser,
};
