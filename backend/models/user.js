// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { Post } = require("./post"); // Ensure you import the Post model

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Not verified",
    },
  },
  {
    timestamps: true,
  }
);

// Define associations
User.hasMany(Post, { foreignKey: "creatorId" });

Post.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
// Post.belongsTo(User, { foreignKey: "creatorId" });

module.exports.User = User;
