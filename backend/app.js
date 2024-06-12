const express = require("express");
const { getFeeds } = require("./controllers/feed.js");
const feedRoutes = require("./routes/feed.js");
const authRoutes = require("./routes/auth");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const path = require("path");
const { isAuth } = require("./middlewares/is-auth");
const { socketIo: io } = require("./socket");
const sequelize = require("./config/database");

const app = express();

app.use((req, res, next) => {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "Content-Type, Authorization");
  res.setHeader("access-control-allow-methods", "PUT, DELETE, POST, PATCH, GET");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
app.use(bodyParser.json());
// // app.use(bodyParser.urlencoded());
app.use("/images", express.static("images"));
app.use((req, res, next) => {
  req.domain = req.protocol + "://" + req.get("host");
  next();
});

app.use("/auth", authRoutes);
app.use("/feed", feedRoutes);

app.use("/health", (req, res, next) => {
  return res
    .status(200)
    .json({ health: "Active", message: "This server is running", statusCode: 200 });
});

app.use((error, req, res, next) => {
  console.log(error);
  return res.status(error.statusCode || 500).json(error);
});

// Sync all models with the database
sequelize
  .sync({ force: false })
  .then(result => {
    const server = require("http").createServer(app);
    io.init(server);
  })
  .catch(err => {
    console.log("Error synchronizing database:", err);
  });
