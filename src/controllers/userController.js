const userService = require("../services/userService");
const omitFields = require("../utils/omitFields");
const validateImmutableFields = require("../utils/validateImmutableFields");

const getUserInfo = async (req, res, next) => {
  try {
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
    next(err); // Pass the error to the error handler middleware
  }
};

const createUserInfo = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    validateImmutableFields(req.body, ["account_created", "account_updated"]);

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
    ];
    const safeUser = omitFields(userObj, fieldsToOmit);

    res.status(201).json(safeUser); // Return 201 if user is created successfully
  } catch (err) {
    next(err);
  }
};

const updateUserInfo = async (req, res, next) => {
  const userId = req.user.id;
  const updates = req.body;

  try {
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
    ];
    const safeUser = omitFields(userObj, fieldsToOmit);
    res.status(200).json(safeUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  createUserInfo,
};

// triggering status checks
// triggering status checks
