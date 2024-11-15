const User = require("../models/user");
const logger = require("../utils/logger");

const checkVerification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error:
          "Email verification required. Please verify your email to continue.",
      });
    }
    next();
  } catch (error) {
    logger.error("Error in checkVerification", { error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = checkVerification;
