const express = require("express");
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/basicAuthentication");

const router = express.Router();

// Public Routes
// router.post("/login", userController.login);
router.post("/user", userController.createUser);

// Protected Routes
router.get("/user/self", authenticate, userController.getUserInfo);
router.put("/user/self", authenticate, userController.updateUser);
// router.get("/users/me", authenticate, userController.getUserInfo);

module.exports = router;
