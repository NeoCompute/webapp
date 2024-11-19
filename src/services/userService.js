const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/tokenGenerator");
const { ValidationError } = require("sequelize");
const { DatabaseError, ValidateError } = require("../errors/customErrors");
const validatePassword = require("../utils/validatePassword");
const logger = require("../utils/logger");
const publishMessageToSNSTopic = require("../utils/publishMessageToSNSTopic");

const dotenv = require("dotenv");
dotenv.config();

const aws_topic_arn = process.env.SNS_TOPIC_ARN;
const token_expiration_time = process.env.TOKEN_EXPIRATION_TIME || 2;

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

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
    logger.info("Initiating user creation", { email, firstName, lastName });

    const passwordError = validatePassword(password);
    if (passwordError) {
      logger.warn("Password validation failed", {
        email,
        reason: passwordError,
      });
      throw new ValidateError(passwordError);
    }

    logger.debug("Checking if user already exists", { email });

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      if (existingUser.isVerified) {
        logger.warn("User already exists and is verified", { email });
        throw new ValidateError(
          "A user with this email already exists and is verified."
        );
      } else {
        logger.warn("User already exists but is not verified", { email });
        throw new ValidateError(
          "A user with this email already exists but is not verified."
        );
      }
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const token = generateToken();
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1); // Token expiration set to 1 hour

    // Generate token and set expiration time for email verification
    const verificationToken = generateToken();
    const verificationTokenExpiry =
      Date.now() + token_expiration_time * 60 * 1000;

    const newUser = await userRepository.createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      token,
      token_expiry: expirationTime,
      verificationToken: verificationToken,
      verificationTokenExpiry: verificationTokenExpiry,
    });

    const message = {
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      verificationToken: verificationToken,
    };

    await publishMessageToSNSTopic(aws_topic_arn, message);

    logger.info("User created successfully", { userId: newUser.id, email });
    return newUser;
  } catch (error) {
    logger.error("Failed to create user", { error: error.message });
    if (error instanceof ValidationError || error instanceof ValidateError) {
      logger.error(error.message);
      throw error;
    }
    throw new DatabaseError("Error creating user.");
  }
};

const updateUser = async (userId, updates) => {
  try {
    const allowedFields = ["firstName", "lastName", "password"];
    logger.info("Initiating user update", { userId, updates });

    // const updateKeys = Object.keys(updates);
    if (updates.hasOwnProperty("password")) {
      if (!updates.password || updates.password.trim() === "") {
        logger.warn("Password update failed - empty password", { userId });
        throw new ValidateError("Password cannot be empty.");
      }

      const passwordError = validatePassword(updates.password);
      if (passwordError) {
        logger.warn("Password validation failed", {
          userId,
          reason: passwordError,
        });
        throw new ValidateError(passwordError);
      }
    }

    const filteredUpdates = filterAllowedFields(updates, allowedFields);

    if (filteredUpdates.password) {
      const salt = await bcrypt.genSalt(saltRounds);
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
      logger.warn("User update failed - user not found", { userId });
      throw new ValidateError("User not found.");
    }

    return updatedUser;
  } catch (error) {
    logger.error("Error in updateUser", { userId, error: error.message });
    if (error instanceof ValidationError || error instanceof ValidateError) {
      throw error;
    }
    throw new DatabaseError("Error updating user.");
  }
};

const verifyUser = async (token) => {
  try {
    const user = await userRepository.findByToken(token);

    if (!user) {
      return { success: false, message: "Invalid or expired token." };
    }
    const now = new Date();
    if (user.verificationTokenExpiry < now) {
      return { success: false, message: "Token has expired." };
    }

    await userRepository.updateUserVerificationStatus(user);
    return { success: true, message: "User verified successfully." };
  } catch (error) {
    logger.error("Error in verifyUser", { error: error.message });
    throw new DatabaseError("Error verifying user.");
  }
};

const deleteUser = async (email) => {
  try {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      logger.warn("User not found", { email });
      throw new ValidateError("User not found");
    }
    await userRepository.deleteUser(user);
    logger.info("User deleted successfully", { email });
  } catch (error) {
    logger.error("Error in deleteUser", { error: error.message });
    if (error instanceof ValidationError || error instanceof ValidateError) {
      throw error;
    }
    throw new DatabaseError("Error deleting user.");
  }
};

module.exports = {
  createUser,
  updateUser,
  verifyUser,
  deleteUser,
};
