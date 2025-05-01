require("dotenv").config(); // aqui é o lugar certo para carregar o .env uma única vez
const { Sequelize } = require("sequelize");
const dbConfig = require("../config/db");
const connection = new Sequelize(dbConfig);

const User = require("../models/User");
const Category = require("../models/Category");
const Login = require("../models/Login");

User.init(connection);
Category.init(connection);

module.exports = connection;
