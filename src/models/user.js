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
        isEmail: {
          msg: "Must be a valid email address",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 30],
          msg: "First name must be between 2 and 30 characters",
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 30],
          msg: "Last name must be between 2 and 30 characters",
        },
      },
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

// You can uncomment the following if you want to enforce immutability for 'account_created' and 'account_updated'
// User.beforeValidate((user, options) => {
//   if (user.changed("account_created") && user.account_created !== undefined) {
//     throw new Error('The field "account_created" cannot be set manually.');
//   }
//   if (user.changed("account_updated") && user.account_updated !== undefined) {
//     throw new Error('The field "account_updated" cannot be set manually.');
//   }
// });

module.exports = User;
