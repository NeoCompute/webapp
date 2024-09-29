const { DataTypes } = require("sequelize");
const { dbConnection } = require("../databases/postgresDbConnection");

const User = dbConnection.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    account_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    apiToken: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

// Hook to update account_updated before updating the user
User.beforeUpdate((user, options) => {
  user.account_updated = new Date();
});

module.exports = User;
