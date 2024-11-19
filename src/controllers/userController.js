const userService = require("../services/userService");
const omitFields = require("../utils/omitFields");
const validateImmutableFields = require("../utils/validateImmutableFields");
const logger = require("../utils/logger");

const getUserInfo = async (req, res, next) => {
  try {
    logger.info("Fetching user information", { userId: req.user.id });
    const user = req.user.toJSON();
    const safeUser = omitFields(user, [
      "password",
      "token",
      "account_created",
      "account_updated",
      "token_expiry",
    ]);
    res.status(200).json(safeUser);
  } catch (err) {
    logger.error("Error in getUserInfo", { error: err.message });
    next(err);
  }
};

const createUserInfo = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    validateImmutableFields(req.body, ["account_created", "account_updated"]);
    logger.info("Creating new user");
    const user = await userService.createUser({
      firstName,
      lastName,
      email,
      password,
    });
    const userObj = user.toJSON();

    const fieldsToOmit = [
      "password",
      "account_created",
      "account_updated",
      "token_expiry",
      "isVerified",
      "verificationToken",
      "verificationTokenExpiry",
    ];
    const safeUser = omitFields(userObj, fieldsToOmit);

    res.status(201).json(safeUser); // Return 201 if user is created successfully
  } catch (err) {
    logger.error("error Creating new user");
    next(err);
  }
};

const updateUserInfo = async (req, res, next) => {
  const userId = req.user.id;
  const updates = req.body;

  try {
    logger.info("Updating user information", { userId: req.user.id });
    validateImmutableFields(req.body, [
      "account_created",
      "account_updated",
      "email",
    ]);
    const updatedUser = await userService.updateUser(userId, updates);
    const userObj = updatedUser.toJSON();

    const fieldsToOmit = [
      "password",
      "account_created",
      "token",
      "account_updated",
      "token_expiry",
      "isVerified",
      "verificationToken",
      "verificationTokenExpiry",
    ];
    const safeUser = omitFields(userObj, fieldsToOmit);
    res.status(200).json(safeUser);
  } catch (error) {
    logger.error("Error in updateUserInfo", { error: error.message });
    next(error);
  }
};

const verifyUserInfo = async (req, res, next) => {
  const { token } = req.params;
  try {
    logger.info("Verifying user information", { token });
    const verificationResult = await userService.verifyUser(token);

    if (verificationResult.success) {
      return res.status(200).json({ message: verificationResult.message });
    } else {
      return res.status(400).json({ message: verificationResult.message });
    }
  } catch (error) {
    logger.error("Error in verifyUser", { error: error.message });
    next(error);
  }
};

const deleteUserInfo = async (req, res, next) => {
  try {
    const email = req.body.email;
    logger.info("Deleting user information", { email });
    await userService.deleteUser(email);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error("Error in deleteUser", { error: error.message });
    next(error);
  }
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  createUserInfo,
  verifyUserInfo,
  deleteUserInfo,
};
