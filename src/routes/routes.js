const express = require("express");
const UserController = require("../controllers/UserContrlller");
const CategoryController = require("../controllers/CategoriesController");
const LoginController = require("../controllers/LoginController");
const ProductController = require("../controllers/ProdutctController"); // Corrigido de "ProdutctController"
const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();
const routerPrivate = express.Router();

routerPrivate.use(authMiddleware);
// Rotas para login
router.post("/users/login", LoginController.login);

// Rotas para Usuarios
router.get("/users", UserController.index);
router.post("/users", UserController.store);
router.get("/users/:id", UserController.show);
router.put("/users/:id", UserController.update);
router.delete("/users/:id", UserController.delete);

//Rotas para Categorias
router.get("/category", CategoryController.index);
router.post("/category", CategoryController.store);
router.get("/category/:id", CategoryController.show);
router.put("/category/:id", CategoryController.update);
router.delete("/category/:id", CategoryController.delete);

// Rotas para produtos
router.get("/product", ProductController.index);
router.post("/product", upload.array("images"), ProductController.store);
router.get("/product/:id", ProductController.show);
router.put("/product/:id", ProductController.update);
router.delete("/product/:id", ProductController.delete);

module.exports = { router, routerPrivate };
