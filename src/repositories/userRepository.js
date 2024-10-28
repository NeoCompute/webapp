const User = require("../models/user");

const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} = require("sequelize");
const { DatabaseError } = require("../errors/customErrors");

const findByToken = async (token) => {
  try {
    const user = await User.findOne({ where: { token } });
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof UniqueConstraintError
    ) {
      throw error;
    }
    throw new DatabaseError("Failed to find user by token");
  }
};

const findByEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof UniqueConstraintError
    ) {
      throw error;
    }
    throw new DatabaseError("Failed to find user by email");
  }
};

const updateUser = async (userId, updates) => {
  try {
    await User.update(updates, { where: { id: userId } });
    const updatedUser = await User.findByPk(userId);
    if (!updatedUser) {
      return null;
    }
    return updatedUser;
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof UniqueConstraintError
    ) {
      throw error;
    }
    throw new DatabaseError("Failed to update user");
  }
};

const createUser = async (userData) => {
  try {
    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new DatabaseError("Failed to create user");
  }
};

module.exports = {
  findByToken,
  findByEmail,
  updateUser,
  createUser,
};
