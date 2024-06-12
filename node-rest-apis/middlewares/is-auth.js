// middleware/isAuth.js
const jwt = require("jsonwebtoken");

const { createErrorObj } = require("../utils/functions");
const { User } = require("../models/user");
const { config } = require("dotenv");

config();

const privateKey = process.env.SECRET_KEY;

exports.isAuth = async (req, res, next) => {
  try {
    let error = new Error("Not authenticated");
    error.statusCode = 401;

    const authorization = req.get("Authorization");
    if (!authorization) {
      throw error;
    }

    const token = req.get("Authorization").split(" ")[1];
    if (!token) {
      throw error;
    }

    const decodedToken = jwt.verify(token, privateKey, { algorithms: "HS256" });
    const userId = decodedToken.id;

    // Assuming your Sequelize User model has a findByPk method
    const user = await User.findByPk(userId);

    if (!user) {
      throw error;
    }

    req.userId = userId;
    next();
  } catch (error) {
    req.userId = null;
    const err = createErrorObj("Not authenticated", error.statusCode);
    next(err);
  }
};
