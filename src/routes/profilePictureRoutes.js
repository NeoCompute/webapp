const express = require("express");
const profilePictureController = require("../controllers/profilePictureController");
const authenticate = require("../middlewares/basicAuthentication");
const methodHandler = require("../middlewares/methodHandler");
const validateJsonContentType = require("../middlewares/validateJsonContentType");
const payloadChecker = require("../middlewares/payloadChecker");
const router = express.Router();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.all("/", methodHandler(["POST", "GET", "DELETE"]));
router.post(
  "/",
  authenticate,
  upload.single("image"),
  profilePictureController.uploadProfilePicture
);
router.get("/", authenticate, profilePictureController.getProfilePicture);
router.delete("/", authenticate, profilePictureController.deleteProfilePicture);

module.exports = router;
