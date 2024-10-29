const Image = require("../models/image");
const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} = require("sequelize");
const { DatabaseError } = require("../errors/customErrors");

const createImage = async (imageData) => {
  try {
    const newImage = await Image.create(imageData);
    return newImage;
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof UniqueConstraintError
    ) {
      throw error;
    }
    throw new DatabaseError("Failed to create Image");
  }
};

const findImageByUserId = async (userId) => {
  try {
    const image = await Image.findOne({ where: { user_id: userId } });
    if (!image) {
      return null;
    }
    return image;
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof UniqueConstraintError
    ) {
      throw error;
    }
    throw new DatabaseError("Failed to find Image by user id");
  }
};

const deleteImageById = async (id) => {
  return Image.destroy({ where: { id } });
};

module.exports = {
  createImage,
  findImageByUserId,
  deleteImageById,
};
