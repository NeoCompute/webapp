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
        is: {
          args: /^[a-zA-Z]+$/i,
          msg: "First name must contain only letters",
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
        is: {
          args: /^[a-zA-Z]+$/i,
          msg: "Last name must contain only letters",
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
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    verificationTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
