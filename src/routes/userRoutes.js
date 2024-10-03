const express = require("express");
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/basicAuthentication");
const methodHandler = require("../middlewares/methodHandler");
const validateJsonContentType = require("../middlewares/validateJsonContentType");

const router = express.Router();

// Public Routes
router.post("/user", validateJsonContentType, userController.createUserInfo);

router.use("/user/self", methodHandler(["GET", "PUT"]));

// Protected Routes
router.get("/user/self", authenticate, userController.getUserInfo);
router.put(
  "/user/self",
  authenticate,
  validateJsonContentType,
  userController.updateUserInfo
); // Applying middleware to validate JSON for PUT /user/self

module.exports = router;
