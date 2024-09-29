const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");
const dotenv = require("dotenv");

dotenv.config();

const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;

// Create a new user
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A user with this email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate API token
    const apiToken = userRepository.generateApiToken();

    // Create user
    const user = await userRepository.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      apiToken, // Assign the generated token
    });

    // Exclude password and apiToken from response
    const { password: _, apiToken: __, ...userData } = user.toJSON();

    res.status(201).json(userData);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Login user and provide API token
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate a new API token
    const apiToken = userRepository.generateApiToken();
    user.apiToken = apiToken;
    await user.save();

    // Exclude password from response
    res.status(200).json({ apiToken });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update user information
const updateUser = async (req, res) => {
  try {
    const userId = req.user.id; // Attached by middleware
    const { firstName, lastName, password, ...others } = req.body;

    // Check for invalid fields
    if (Object.keys(others).length > 0) {
      return res.status(400).json({
        message: "Only firstName, lastName, and password can be updated.",
      });
    }

    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      updateData.password = hashedPassword;
    }

    const updatedUser = await userRepository.updateUser(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Exclude password and apiToken from response
    const { password: _, apiToken: __, ...userData } = updatedUser.toJSON();

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get user information
const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id; // Attached by middleware

    const user = await userRepository.findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Exclude password and apiToken from response
    const { password: _, apiToken: __, ...userData } = user.toJSON();

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Logout user by invalidating the token
const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userRepository.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Invalidate the token
    user.apiToken = null;
    await user.save();

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  createUser,
  updateUser,
  getUserInfo,
  login,
  logout,
};
