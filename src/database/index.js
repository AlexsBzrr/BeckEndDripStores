require("dotenv").config();

const { Sequelize } = require("sequelize");
const dbConfig = require("../config/db");
const connection = new Sequelize(dbConfig);

// Importação dos modelos
const User = require("../models/user");
const Category = require("../models/category");
const Product = require("../models/product");
const Image = require("../models/images");
const Option = require("../models/options");
const Cliente = require("../models/cliente");

// Inicializando os modelos
User.init(connection);
Cliente.init(connection);
Product.init(connection);
Category.init(connection);
Image.init(connection);
Option.init(connection);

// Executando as associações - verificando se o método existe antes de chamar
if (User.associate) User.associate(connection.models);
if (Cliente.associate) Cliente.associate(connection.models);
if (Product.associate) Product.associate(connection.models);
if (Category.associate) Category.associate(connection.models);
if (Image.associate) Image.associate(connection.models);
if (Option.associate) Option.associate(connection.models);

module.exports = {
  sequelize: connection,
};
