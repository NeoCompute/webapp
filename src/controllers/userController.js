const userService = require("../services/userService");

const getUserInfo = async (req, res) => {
  const user = req.user;
  // Exclude sensitive fields like password and token
  try {
    const { password, token, account_created, account_updated, ...userData } =
      user.toJSON();
    res.status(200).json(userData);
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
    const {
      password: _,
      account_created,
      account_updated,
      ...safeUser
    } = userObj;

    res.status(201).json(safeUser);
  } catch (err) {
    console.error("Create user error:", err);
    res.status(400).json({ message: "Failed to create user" });
  }
};

const updateUserInfo = async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  try {
    const updatedUser = await userService.updateUser(userId, updates);
    const { password, token, account_created, account_updated, ...userData } =
      updatedUser.toJSON();
    res.status(200).json(userData);
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
