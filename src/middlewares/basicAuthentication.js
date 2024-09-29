const userRepository = require("../repositories/userRepository");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing." });
  }

  // Expecting format: "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid authorization format." });
  }

  const token = parts[1];

  try {
    const user = await userRepository.findUserByToken(token);
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    // Attach user information to the request object
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = authenticate;
