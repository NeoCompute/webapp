const imageRepository = require("../repositories/imageRepository");
const { uploadImage, deleteImage, getImageUrl } = require("../utils/s3Client");
// const { v4: uuidv4 } = require("uuid");
const { DatabaseError, ValidateError } = require("../errors/customErrors");
const logger = require("../utils/logger");

const bucketName = process.env.S3_BUCKET_NAME;

const uploadProfilePicture = async (
  userId,
  fileBuffer,
  fileExtension,
  mimetype
) => {
  // const fileName = `${userId}/${uuidv4()}.${fileExtension}`;
  const fileName = `${userId}/image-file.${fileExtension}`;
  logger.info("fileName: ", fileName);
  logger.info("Initiating profile picture upload", {
    userId,
    fileName,
    bucketName,
  });

  try {
    await uploadImage(fileBuffer, fileName, bucketName, mimetype);
    const imageUrl = getImageUrl(bucketName, fileName);

    const imageData = {
      file_name: fileName,
      url: imageUrl,
      user_id: userId,
    };

    const savedImage = await imageRepository.createImage(imageData);
    logger.info(
      "Profile picture uploaded and saved to repository successfully",
      {
        userId,
        fileName,
        imageUrl,
      }
    );
    return savedImage;
  } catch (error) {
    logger.error("Failed to upload profile picture", {
      userId,
      fileName,
      error: error.message,
    });
    throw new DatabaseError("Error while uploading profile picture.");
  }
};

const getProfilePicture = async (userId) => {
  logger.info("Retrieving profile picture", { userId });
  try {
    const image = await imageRepository.findImageByUserId(userId);

    if (image) {
      logger.info("Profile picture retrieved successfully", {
        userId,
        fileName: image.file_name,
      });
    } else {
      logger.warn("Profile picture not found for user", { userId });
    }
    return image;
  } catch (error) {
    logger.error("Failed to retrieve profile picture", {
      userId,
      error: error.message,
    });
    throw new DatabaseError("Error while retrieving profile picture.");
  }
};

const deleteProfilePicture = async (userId) => {
  logger.info("Attempting to delete profile picture", { userId, bucketName });

  try {
    const image = await imageRepository.findImageByUserId(userId);

    if (!image) {
      logger.warn("Profile picture not found for deletion", { userId });
      throw new ValidateError("Profile picture not found.");
    }

    await deleteImage(image.file_name, bucketName);
    await imageRepository.deleteImageById(image.id);
    logger.info("Profile picture deleted successfully from repository and S3", {
      userId,
      fileName: image.file_name,
    });
    return image;
  } catch (error) {
    logger.error("Failed to delete profile picture", {
      userId,
      error: error.message,
    });
    if (error instanceof ValidateError) {
      throw error;
    }
    throw new DatabaseError("Error while deleting profile picture.");
  }
};

module.exports = {
  uploadProfilePicture,
  getProfilePicture,
  deleteProfilePicture,
};
