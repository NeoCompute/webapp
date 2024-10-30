const { DataTypes } = require("sequelize");
const { dbConnection } = require("../databases/postgresDbConnection");

const Image = dbConnection.define(
  "Image",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: "File name must be between 1 and 255 characters",
        },
      },
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    upload_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users", // Should match the name of your user table
        key: "id",
      },
    },
  },
  {
    tableName: "images",
    timestamps: false,
  }
);

// Hook to update `upload_date` before updating the image (if you need this functionality)
Image.beforeUpdate((image, options) => {
  image.upload_date = new Date();
});

module.exports = Image;
