const express = require("express");
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/basicAuthentication");
const methodHandler = require("../middlewares/methodHandler");

const router = express.Router();

// Public Routes
router.post("/user", userController.createUserInfo);

router.use("/user/self", methodHandler(["GET", "PUT"]));

// Protected Routes
router.get("/user/self", authenticate, userController.getUserInfo);
router.put("/user/self", authenticate, userController.updateUserInfo);

module.exports = router;
