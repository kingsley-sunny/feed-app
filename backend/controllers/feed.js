// controllers/posts.js
const { Post } = require("../models/post");
const { User } = require("../models/user");
const {
  createErrorObj,
  createSuccessObj,
  createPagiantedSuccessObj,
} = require("../utils/functions");
const { socketIo: io } = require("../socket");

const MAX_ITEMS_PER_PAGE = 3;

exports.getPosts = async (req, res, next) => {
  const pageNo = +req.query.page || 1;
  try {
    const totalPost = await Post.count();
    const posts = await Post.findAll({
      offset: MAX_ITEMS_PER_PAGE * (pageNo - 1),
      limit: MAX_ITEMS_PER_PAGE,
      include: [{ model: User, as: "creator" }],
    });
    console.log("🚀 ~~ exports.getPosts= ~~ posts:", posts);

    const pageMetaData = {
      prevPageUrl: pageNo > 1 ? `${req.domain}/feed/post?page=${pageNo - 1}` : null,
      nextPageUrl:
        Math.ceil(totalPost / MAX_ITEMS_PER_PAGE) > pageNo
          ? `${req.domain}/feed/posts?page=${pageNo + 1}`
          : null,
      totalPages: Math.ceil(totalPost / MAX_ITEMS_PER_PAGE),
      totalItems: totalPost,
    };

    return res.status(200).json(createPagiantedSuccessObj(posts, pageMetaData));
  } catch (error) {
    const err = createErrorObj(error.message, error.statusCode);
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!req.file) {
      throw createErrorObj("image is required", 422);
    }

    const post = await Post.create({
      title,
      content,
      imageUrl: `${req.domain}/${req.file.path}`,
      creatorId: req.userId,
    });
    console.log("🚀 ~~ exports.createPost= ~~ post:", post);

    const socket = io.getIO();
    const user = await User.findByPk(req.userId);
    await user.addPost(post);

    socket.emit("post", {
      action: "create",
      data: { ...post.toJSON(), creator: { _id: req.userId, name: user.name } },
    });

    return res.status(201).json(createSuccessObj(post, "Post Successfully Created!", 201));
  } catch (error) {
    const err = createErrorObj(error.message, error.statusCode);
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findByPk(postId, { include: [{ model: User, as: "creator" }] });
    if (post) {
      return res.status(200).json(createSuccessObj(post));
    } else {
      return res.status(404).json(createSuccessObj(null, "Post Not found!", 404));
    }
  } catch (error) {
    const err = createErrorObj(error.message, error.statusCode);
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const { title, content } = req.body;

    let post = await Post.findByPk(postId, { include: [{ model: User, as: "creator" }] });
    if (!post) {
      const err = new Error("Post not found");
      err.statusCode = 404;
      throw err;
    }

    post.title = title;
    post.content = content;

    if (req.file) {
      post.imageUrl = `${req.domain}/${req.file.path}`;
    }

    await post.save({});

    const socket = io.getIO();
    socket.emit("post", { action: "update", data: post });

    return res.status(200).json(createSuccessObj(post, "Post Successfully Updated!", 200));
  } catch (error) {
    const err = createErrorObj(error.message, error.statusCode);
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json(createSuccessObj(null, "Post Not found!", 404));
    }

    await post.destroy();

    return res.status(200).json(createSuccessObj(null, "Post Successfully Deleted!"));
  } catch (error) {
    const err = createErrorObj(error.message, error.statusCode);
    next(err);
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 403;
      throw err;
    }
    res.status(200).json({ message: "Success", data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 403;
      throw err;
    }
    user.status = req.body.status;
    await user.save();
    // Adjust this part based on how you handle socket.io in your Sequelize setup
    const socket = io.getIO();
    socket.emit("updated-status", user);
    res.status(201).json({ message: "Successfully updated status", data: user });
  } catch (error) {
    next(error);
  }
};
