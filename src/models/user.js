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
    token: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    token_expiry: {
      type: DataTypes.DATE,
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

// Prevent manual setting of 'account_created' and 'account_updated'
// User.beforeValidate((user, options) => {
//   if (user.changed("account_created") && user.account_created !== undefined) {
//     throw new Error('The field "account_created" cannot be set manually.');
//   }
//   if (user.changed("account_updated") && user.account_updated !== undefined) {
//     throw new Error('The field "account_updated" cannot be set manually.');
//   }
// });

module.exports = User;
