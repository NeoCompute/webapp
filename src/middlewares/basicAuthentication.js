const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcrypt");

const basicAuthentication = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const [scheme, credentials] = authHeader.split(" ");

  if (scheme === "Basic") {
    // Handle Basic Auth
    const decodedCredentials = Buffer.from(credentials, "base64").toString(
      "utf-8"
    );
    const [email, password] = decodedCredentials.split(":");

    if (!email || !password) {
      return res
        .status(401)
        .json({ message: "Invalid Basic Authorization format" });
    }

    try {
      // Find the user by email
      const user = await userRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Attach user to request
      req.user = user;
      return next(); // Authentication successful, proceed to the next middleware or controller
    } catch (error) {
      console.error("Basic Authentication error:", error);
      return next(error);
    }
  } else if (scheme === "Bearer") {
    // Handle Bearer Token
    const token = credentials;

    try {
      const user = await userRepository.findByToken(token);
      if (!user) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      const now = new Date();
      if (now > user.token_expiry) {
        return res.status(401).json({ message: "Token expired" });
      }

      // Attach user to request
      req.user = user;
      return next();
    } catch (error) {
      console.error("Bearer token authentication error:", error);
      return next(error);
    }
  } else {
    return res.status(401).json({
      message: "Unsupported authorization method. Use Basic or Bearer",
    });
  }
};

module.exports = basicAuthentication;
