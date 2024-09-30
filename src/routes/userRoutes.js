const express = require("express");
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/basicAuthentication");
const methodNotAllowed = require("../middlewares/methodNotAllowed");

const router = express.Router();

// Public Routes
router.post("/user", userController.createUserInfo);

router.use("/user/self", methodNotAllowed);

// Protected Routes
router.get("/user/self", authenticate, userController.getUserInfo);
router.put("/user/self", authenticate, userController.updateUserInfo);

module.exports = router;
