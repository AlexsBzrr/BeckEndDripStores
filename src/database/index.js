// src/database/index.js
require("dotenv").config(); // aqui é o lugar certo para carregar o .env uma única vez

const { Sequelize } = require("sequelize");
const dbConfig = require("../config/db");
const connection = new Sequelize(dbConfig);

// Importação dos modelos
const User = require("../models/User");
const Category = require("../models/category");
const Product = require("../models/product"); // Note que foi corrigido de Products para Product
const Image = require("../models/images"); // Corrigido de Images para Image (singular)
const Option = require("../models/options"); // Corrigido de Options para Option (singular)

// Inicializando os modelos
User.init(connection);
Product.init(connection);
Category.init(connection);
Image.init(connection);
Option.init(connection);

// Executando as associações - verificando se o método existe antes de chamar
if (User.associate) User.associate(connection.models);
if (Product.associate) Product.associate(connection.models);
if (Category.associate) Category.associate(connection.models);
if (Image.associate) Image.associate(connection.models);
if (Option.associate) Option.associate(connection.models);

module.exports = connection;
