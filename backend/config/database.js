// config/database.js
const { Sequelize } = require("sequelize");
const { config } = require("dotenv");

config();

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbHost = process.env.DB_HOST;
const dbDialect = process.env.DB_DIALECT;

const sequelize = new Sequelize(dbName, user, password, {
  host: dbHost,
  dialect: dbDialect,
});

module.exports = sequelize;
