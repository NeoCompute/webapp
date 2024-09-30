const userService = require("../services/userService");
const omitFields = require("../utils/omitFields");

const getUserInfo = async (req, res) => {
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
    console.error("Fetch user error:", err);
    res.status(400).json({ message: "Failed to fetch user information" });
  }
};

const createUserInfo = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
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
    console.error("Create user error:", err);
    if (err.message === "A user with this email already exists.") {
      return res.status(400).json({ message: err.message });
    }
    res.status(400).json({ message: "Failed to create user" });
  }
};

const updateUserInfo = async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  try {
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
    console.error("Update error:", error);
    res.status(400).json({ message: "Failed to update user information" });
  }
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  createUserInfo,
};
