const express = require("express");
const validate = require("express-validator");

const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  updateUserStatus,
  getUserStatus,
} = require("../controllers/feed");
const multer = require("multer");
const { createErrorObj } = require("../utils/functions");
const { isAuth } = require("../middlewares/is-auth");

const storage = multer.diskStorage({
  destination: "images",
  filename: (err, file, cb) => {
    cb(null, `${Date.now().toString(36)}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const { title, content } = req.body;

  console.log("hello");

  if (!title || !content) {
    return cb(createErrorObj("Please your title or content should not be empty", 422), false);
  }
  if (title.trim().length < 5 || content.trim().length < 10) {
    return cb(
      createErrorObj(
        "Please your content must be min 10 characters and title must be min 5 characters long",
        422
      ),
      false
    );
  }
  if (!file.mimetype.includes("image")) {
    return cb(createErrorObj("file must be an image", 422), false);
  }

  cb(null, true);
};

const upload = multer({ storage, fileFilter });

const router = express.Router();

router.get("/posts", isAuth, getPosts);

router.get("/posts/:postId", isAuth, getPost);

router.post("/post", isAuth, upload.single("image"));

router.put("/post/:postId", isAuth, upload.single("image"));

router.post(
  "/post",
  isAuth,
  [
    validate.body("title", "Please add a title").trim().isLength({ min: 5 }),
    validate.body("content", "Please add a content").trim().isLength({ min: 10 }),
  ],
  createPost
);

router.put(
  "/post/:postId",
  isAuth,
  [
    validate.body("title", "Please add a title").trim().isLength({ min: 5 }),
    validate.body("content", "Please add a content").trim().isLength({ min: 10 }),
  ],
  updatePost
);

router.delete("/post/:postId", isAuth, deletePost);

router.get("/status", isAuth, getUserStatus);

router.post("/status", isAuth, updateUserStatus);

module.exports = router;
