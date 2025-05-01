const express = require("express");
const UserController = require("./controllers/UserContrlller");
const CategoryController = require("./controllers/CategoriesController");
const authMiddleware = require("./models/middleware/auth");
const router = express.Router();
const LoginController = require("./controllers/LoginController");

//router.use(authMiddleware);
// Rotas para login
router.post("/users/login", LoginController.login);

// Rotas para usuários
router.post("/users", authMiddleware, UserController.store);
router.get("/users", authMiddleware, UserController.index);
router.get("/users/:id", authMiddleware, UserController.show);
router.put("/users/:id", authMiddleware, UserController.update);
router.delete("/users/:id", authMiddleware, UserController.delete);

//Rotas para Categorias
router.get("/category", authMiddleware, CategoryController.index);
router.post("/category", authMiddleware, CategoryController.store);
router.get("/category/:id", authMiddleware, CategoryController.show);
router.put("/category/:id", authMiddleware, CategoryController.update);
router.delete("/category/:id", authMiddleware, CategoryController.delete);

module.exports = router;
