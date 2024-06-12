// controllers/auth.js
const { hash, compare } = require("bcrypt");
const { User } = require("../models/user");
const { createSuccessObj, createErrorObj } = require("../utils/functions");
const { validationResult } = require("express-validator");
const { sign } = require("jsonwebtoken");
const { config } = require("dotenv");

config();

exports.createUser = async (req, res, next) => {
  try {
    const { name, password, email } = req.body;
    const error = validationResult(req).array()[0];
    if (error) {
      const err = new Error(error.msg);
      err.statusCode = 422;
      throw err;
    }

    const user = await User.findOne({ where: { email } });
    if (user) {
      const err = new Error("Email already exists");
      err.statusCode = 422;
      throw err;
    }

    const hashedPassword = await hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      status: "Not verified", // Default status if not specified
    });

    return res
      .status(201)
      .json(
        createSuccessObj(
          { name: newUser.name, email: newUser.email, id: newUser.id },
          "User successfully created"
        ),
        201
      );
  } catch (error) {
    const err = createErrorObj(error.message, error.statusCode);
    next(err);
  }
};

// controllers/auth.js
exports.login = async (req, res, next) => {
  try {
    const { password, email } = req.body;

    const user = await User.findOne({
      where: { email },
      attributes: ["id", "name", "email", "password", "status"],
    });
    if (!user) {
      const err = new Error("No user with the email exists");
      err.statusCode = 422;
      throw err;
    }

    const isPasswordMatch = await compare(password, user.password);
    if (!isPasswordMatch) {
      const err = new Error("Password does not match");
      err.statusCode = 422;
      throw err;
    }

    const token = sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.SECRET_KEY,
      {
        expiresIn: "2hr",
        algorithm: "HS256",
      }
    );

    return res.status(200).json(
      createSuccessObj(
        {
          name: user.name,
          email: user.email,
          status: user.status,
          token,
          id: user.id,
        },
        "Successfully logged in"
      )
    );
  } catch (error) {
    const err = createErrorObj(error.message, error.statusCode);
    next(err);
  }
};
