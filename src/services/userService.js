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
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + 1); // Token expiration set to 1 hour

  // Create the user, ignoring account_created and account_updated if provided in userData
  const newUser = await userRepository.createUser({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    token,
    token_expiry: expirationTime,
  });

  return newUser;
};

const updateUser = async (userId, updates) => {
  const allowedFields = ["firstName", "lastName", "password"];

  const updateKeys = Object.keys(updates);
  const invalidFields = updateKeys.filter(
    (key) => !allowedFields.includes(key)
  );

  // If there are any invalid fields, throw an error and return 400
  if (invalidFields.length > 0) {
    throw new Error(
      `The following fields cannot be updated: ${invalidFields.join(", ")}`,
      400
    );
  }

  const filteredUpdates = updateKeys
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

  // Hash the password if it is being updated
  if (filteredUpdates.password) {
    const salt = await bcrypt.genSalt(10);
    filteredUpdates.password = await bcrypt.hash(
      filteredUpdates.password,
      salt
    );
  }

  // Always set account_updated to the current time
  filteredUpdates.account_updated = new Date();

  // Perform the update operation
  const updatedUser = await userRepository.updateUser(userId, filteredUpdates);

  if (!updatedUser) {
    throw new Error("User not found.", 404);
  }

  return updatedUser;
};

// const updateUser = async (userId, updates) => {
//   const allowedFields = ["firstName", "lastName", "password"];
//   const filteredUpdates = Object.keys(updates)
//     .filter((key) => allowedFields.includes(key))
//     .reduce((obj, key) => {
//       obj[key] = updates[key];
//       return obj;
//     }, {});

//   const invalidFields = Object.keys(updates).filter(
//     (key) => !allowedFields.includes(key)
//   );

//   if (
//     invalidFields.includes("account_created") ||
//     invalidFields.includes("account_updated")
//   ) {
//     console.log("Ignoring account_created or account_updated fields");
//   }

//   if (filteredUpdates.password) {
//     const salt = await bcrypt.genSalt(10);
//     filteredUpdates.password = await bcrypt.hash(
//       filteredUpdates.password,
//       salt
//     );
//   }
//   filteredUpdates.account_updated = new Date();
//   // Perform the update operation
//   const updatedUser = await userRepository.updateUser(userId, filteredUpdates);
//   if (!updatedUser) {
//     throw new Error("User not found.", 404);
//   }
//   return updatedUser;
// };

module.exports = {
  createUser,
  updateUser,
};
