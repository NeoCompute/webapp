const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/tokenGenerator");
const { ValidationError } = require("sequelize");
const { DatabaseError, ValidateError } = require("../errors/customErrors");
const validatePassword = require("../utils/validatePassword");
const logger = require("../utils/logger");

const dotenv = require("dotenv");
dotenv.config();

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

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      logger.warn("User already exists", { email });
      throw new ValidateError("A user with this email already exists.");
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const token = generateToken();
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1); // Token expiration set to 1 hour

    // Generate token and set expiration time for email verification
    const verificationToken = generateToken();
    const verificationTokenExpiry = Date.now() + 2 * 60 * 1000;

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

    logger.info("User created successfully", { userId: newUser.id, email });

    const message = {
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      verificationToken: verificationToken,
      verificationTokenExpires: verificationTokenExpiry.toISOString(),
    };

    const params = {
      Message: JSON.stringify(message),
      TopicArn: process.env.SNS_TOPIC_ARN,
    };

    await sns.publish(params).promise();
    logger.info("Verification email published to SNS", {
      email: newUser.email,
    });

    return newUser;
  } catch (error) {
    logger.error("Failed to create user", { email, error: error.message });
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
    const user = await User.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          [Op.gt]: Date.now(),
        },
      },
    });

    if (!user) {
      throw new ValidateError("Invalid or expired token");
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();
  } catch (error) {
    logger.error("Error in verifyUser", { error: error.message });
    if (error instanceof ValidationError || error instanceof ValidateError) {
      throw error;
    }
    throw new DatabaseError("Error verifying user.");
  }
};

module.exports = {
  createUser,
  updateUser,
  verifyUser,
};
