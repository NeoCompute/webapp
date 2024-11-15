const express = require("express");
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/basicAuthentication");
const methodHandler = require("../middlewares/methodHandler");
const validateJsonContentType = require("../middlewares/validateJsonContentType");
const payloadChecker = require("../middlewares/payloadChecker");
const checkIfVerified = require("../middlewares/checkIfVerified");
const router = express.Router();

router.all("/self", methodHandler(["GET", "PUT"]));
router.post("/", validateJsonContentType, userController.createUserInfo);
// Protected Routes
router.get(
  "/self",
  authenticate,
  checkIfVerified,
  payloadChecker,
  userController.getUserInfo
);
router.put(
  "/self",
  authenticate,
  checkIfVerified,
  validateJsonContentType,
  userController.updateUserInfo
);
router.get("/verify/:token", userController.verifyUserInfo);

module.exports = router;
