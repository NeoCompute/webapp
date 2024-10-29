const imageRepository = require("../repositories/imageRepository");
const { uploadImage, deleteImage, getImageUrl } = require("../utils/s3Client");
const { v4: uuidv4 } = require("uuid");
const bucketName = process.env.S3_BUCKET_NAME;

const uploadProfilePicture = async (userId, fileBuffer, fileExtension) => {
  const fileName = `${userId}/${uuidv4()}.${fileExtension}`;
  await uploadImage(fileBuffer, fileName, bucketName);

  const imageUrl = getImageUrl(bucketName, fileName);

  const imageData = {
    file_name: fileName,
    url: imageUrl,
    user_id: userId,
  };

  return imageRepository.createImage(imageData);
};

const getProfilePicture = async (userId) => {
  return imageRepository.findImageByUserId(userId);
};

const deleteProfilePicture = async (userId) => {
  const image = await imageRepository.findImageByUserId(userId);

  if (!image) {
    throw new Error("Profile picture not found");
  }

  await deleteImage(image.file_name, bucketName);
  await imageRepository.deleteImageById(image.id);

  return image;
};

module.exports = {
  uploadProfilePicture,
  getProfilePicture,
  deleteProfilePicture,
};
