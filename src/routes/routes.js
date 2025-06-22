const express = require("express");
const UserController = require("../controllers/UserControllers.js");
const CategoryController = require("../controllers/CategoriesControllers");
const LoginController = require("../controllers/LoginControllers");
const ClienteController = require("../controllers/ClienteControllers");
const ProductController = require("../controllers/ProductControllers");
const LoginClienteController = require("../controllers/LoginClienteControllers");
const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();
// Rotas para login
router.post("/login", LoginController.login);

// Rotas para login Clientes
router.post("/loginCliente", LoginClienteController.login);

// Rotas para Usuarios
router.get("/user", UserController.index);
router.get("/user/:id", UserController.show);
router.post("/user", authMiddleware, UserController.store);
router.put("/user/:id", authMiddleware, UserController.update);
router.delete("/user/:id", authMiddleware, UserController.delete);

// Rotas para clientes
router.get("/clientes", ClienteController.index);
router.get("/clientes/:id", ClienteController.show);
router.post("/clientes", ClienteController.store);
router.put("/clientes/:id", ClienteController.update);
router.delete("/clientes/:id", ClienteController.delete);

//Rotas para Categorias
router.get("/category/search", CategoryController.search);
router.get("/category/:id", CategoryController.show);
router.post("/category", authMiddleware, CategoryController.store);
router.put("/category/:id", authMiddleware, CategoryController.update);
router.delete("/category/:id", authMiddleware, CategoryController.delete);

// Rotas para produtos
router.get("/product/search", ProductController.search);
router.get("/product/:id", ProductController.show);
router.post("/product", authMiddleware, upload, ProductController.store);
router.put("/product/:id", authMiddleware, ProductController.update);
router.delete("/product/:id", authMiddleware, ProductController.delete);

module.exports = router;
