const omitFields = require("../utils/omitFields");
const validateImmutableFields = require("../utils/validateImmutableFields");
const logger = require("../utils/logger");
const profilePictureService = require("../services/profilePictureService");

// const uploadProfilePicture = async (req, res) => {
//   try {
//     logger.info("Starting profile picture upload process");
//     const authenticatedUserId = req.user.id;
//     const { userId } = req.body;
//     const file = req.file;

//     if (userId && userId !== authenticatedUserId) {
//       return res.status(403).json({
//         message:
//           "You are not allowed to upload a profile picture to this account.",
//       });
//     }

//     // Validate file type
//     if (
//       !file ||
//       !["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)
//     ) {
//       return res.status(400).json({
//         message:
//           "Unsupported file format. Please upload a PNG, JPG, or JPEG file.",
//       });
//     }

//     // Check if a profile picture already exists for the user
//     const existingImage = await profilePictureService.getProfilePicture(userId);
//     if (existingImage) {
//       return res.status(409).json({
//         message:
//           "There is already a profile picture. Please delete it before uploading a new one.",
//       });
//     }

//     const fileExtension = file.mimetype.split("/")[1];
//     const image = await profilePictureService.uploadProfilePicture(
//       userId,
//       file.buffer,
//       fileExtension
//     );

//     res.status(201).json(image);
//   } catch (error) {
//     logger.error("Failed to upload profile picture:", error);
//     res.status(500).json({
//       message: "Failed to upload profile picture",
//       error: error.message,
//     });
//   }
// };

// const getProfilePicture = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const image = await profilePictureService.getProfilePicture(userId);

//     if (!image) {
//       return res.status(404).json({ message: "Profile picture not found" });
//     }

//     res.status(200).json(image);
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to retrieve profile picture",
//       error: error.message,
//     });
//   }
// };

// const deleteProfilePicture = async (req, res) => {
//   try {
//     const authenticatedUserId = req.user.id;

//     await profilePictureService.deleteProfilePicture(authenticatedUserId);

//     res.status(200).json({ message: "Profile picture deleted successfully" });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to delete profile picture",
//       error: error.message,
//     });
//   }
// };

const SUPPORTED_FILE_TYPES = ["image/png", "image/jpg", "image/jpeg"];

const sendErrorResponse = (res, status, message, logData = {}) => {
  logger.warn(message, logData);
  res.status(status).json({ message });
};

const isAuthorizedUser = (authenticatedUserId, userId) => {
  return userId && userId === authenticatedUserId;
};

const isValidFileType = (file) => {
  return file && SUPPORTED_FILE_TYPES.includes(file.mimetype);
};

const uploadProfilePicture = async (req, res, next) => {
  try {
    const { id: authenticatedUserId } = req.user;
    const { userId } = req.body;
    const file = req.file;

    logger.info("Starting profile picture upload", {
      authenticatedUserId,
      targetUserId: userId,
    });

    if (!isAuthorizedUser(authenticatedUserId, userId)) {
      return sendErrorResponse(
        res,
        403,
        "Unauthorized profile picture upload attempt",
        { authenticatedUserId, targetUserId: userId }
      );
    }

    if (!isValidFileType(file)) {
      return sendErrorResponse(res, 400, "Unsupported file format", {
        userId,
        fileType: file ? file.mimetype : null,
      });
    }

    const existingImage = await profilePictureService.getProfilePicture(userId);
    if (existingImage) {
      return sendErrorResponse(res, 409, "Profile picture already exists", {
        userId,
      });
    }

    const fileExtension = file.mimetype.split("/")[1];
    const image = await profilePictureService.uploadProfilePicture(
      userId,
      file.buffer,
      fileExtension
    );

    logger.info("Profile picture uploaded successfully", {
      userId,
      fileName: image.file_name,
    });
    res.status(201).json(image);
  } catch (error) {
    logger.error("Failed to upload profile picture", {
      error: error.message,
      userId: req.user.id,
    });
    next(error);
  }
};

const getProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.id;
    logger.info("Fetching profile picture", { userId });

    const image = await profilePictureService.getProfilePicture(userId);

    if (!image) {
      return sendErrorResponse(res, 404, "Profile picture not found", {
        userId,
      });
    }

    res.status(200).json(image);
  } catch (error) {
    logger.error("Failed to retrieve profile picture", {
      error: error.message,
      userId: req.user.id,
    });
    next(error);
  }
};

const deleteProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.id;
    logger.info("Deleting profile picture", { userId });

    await profilePictureService.deleteProfilePicture(userId);

    logger.info("Profile picture deleted successfully", { userId });
    res.status(200).json({ message: "Profile picture deleted successfully" });
  } catch (error) {
    logger.error("Failed to delete profile picture", {
      error: error.message,
      userId: req.user.id,
    });
    next(error);
  }
};

module.exports = {
  uploadProfilePicture,
  getProfilePicture,
  deleteProfilePicture,
};
