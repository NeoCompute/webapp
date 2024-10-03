/**
 * Validates the password based on common best practices
 * - Password must be between 12 and 128 characters.
 * - Must contain at least one uppercase letter, one lowercase letter, one number, and one special character.
 * - Should not be empty or contain only spaces.
 * @param {string} password - The password to be validated.
 * @returns {object|null} Returns an error message if invalid, or null if the password is valid.
 */
function validatePassword(password) {
  if (!password || password.trim() === "") {
    return "Password cannot be empty.";
  }

  if (password.length < 8 || password.length > 128) {
    return "Password must be between 12 and 128 characters.";
  }

  const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])[a-zA-Z\d\W_]{8,}$/;

  if (!passwordRegex.test(password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  return null;
}

module.exports = validatePassword;
