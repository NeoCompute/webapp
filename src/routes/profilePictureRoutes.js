const express = require("express");
const profilePictureController = require("../controllers/profilePictureController");
const authenticate = require("../middlewares/basicAuthentication");
const methodHandler = require("../middlewares/methodHandler");
const validateJsonContentType = require("../middlewares/validateJsonContentType");
const payloadChecker = require("../middlewares/payloadChecker");
const checkIfVerified = require("../middlewares/checkIfVerified");
const router = express.Router();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.all("/", methodHandler(["POST", "GET", "DELETE"]));
router.post(
  "/",
  authenticate,
  checkIfVerified,
  upload.single("profilePic"),
  profilePictureController.uploadProfilePicture
);
router.get(
  "/",
  authenticate,
  checkIfVerified,
  profilePictureController.getProfilePicture
);
router.delete(
  "/",
  authenticate,
  checkIfVerified,
  profilePictureController.deleteProfilePicture
);

module.exports = router;
