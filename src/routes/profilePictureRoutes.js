const express = require("express");
const profilePictureController = require("../controllers/profilePictureController");
const authenticate = require("../middlewares/basicAuthentication");
const methodHandler = require("../middlewares/methodHandler");
const validateJsonContentType = require("../middlewares/validateJsonContentType");
const payloadChecker = require("../middlewares/payloadChecker");
const router = express.Router();

const multer = require("multer");

// router.use("/user/self/pic", methodHandler(["POST", "GET", "DELETE"]));
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/user/self/pic",
  authenticate,
  upload.single("image"),
  profilePictureController.uploadProfilePicture
);

router.get(
  "/user/self/pic",
  authenticate,
  profilePictureController.getProfilePicture
);

router.delete(
  "/user/self/pic",
  authenticate,
  profilePictureController.deleteProfilePicture
);

module.exports = router;
