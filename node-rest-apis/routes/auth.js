const express = require("express");
const { createUser, login } = require("../controllers/auth");
const validate = require("express-validator");

const router = express.Router();

router.post(
  "/signup",
  [
    validate.body("name", "Name must be a valid name").trim().isLength({ min: 3 }),
    validate
      .body("email", "Email must Must be a valid e-mail address")
      .trim()
      .isEmail()
      .toLowerCase(),
    validate
      .body("password", "Password must Must be minium of 5 characters")
      .trim()
      .isLength({ min: 5 }),
  ],
  createUser
);

router.post("/login", login);

module.exports = router;
