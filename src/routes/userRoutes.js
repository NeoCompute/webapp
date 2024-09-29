const express = require("express");
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/basicAuthentication");

const router = express.Router();

// Public Routes
// router.post("/login", userController.login);
router.post("/user", userController.createUserInfo);

// Protected Routes
router.get("/user/self", authenticate, userController.getUserInfo);
router.put("/user/self", authenticate, userController.updateUserInfo);
// router.get("/users/me", authenticate, userController.getUserInfo);

module.exports = router;
