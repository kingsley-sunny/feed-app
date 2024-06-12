// models/Post.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Post = sequelize.define(
  "Post",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // imageName: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    //   defaultValue: "",
    // },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // imagePath: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    //   defaultValue: "",
    // },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

// Assuming you have defined the association in your Post model
module.exports.Post = Post;
