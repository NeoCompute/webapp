const userRepository = require("../repositories/userRepository");

const basicAuthentication = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ message: "Invalid authorization format. Use Bearer <token>" });
  }

  try {
    const user = await userRepository.findByToken(token);
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user to request for further use
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = basicAuthentication;
