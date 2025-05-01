const express = require("express");
const UserController = require("./controllers/UserContrlller");
const CategoryController = require("./controllers/CategoriesController");
const authMiddleware = require("./models/middleware/auth");
const router = express.Router();

//router.use(authMiddleware);

// Rotas para usuários
router.post("/users", UserController.store);
router.get("/users", authMiddleware, UserController.index);
router.get("/users/:id", UserController.show);
router.put("/users/:id", UserController.update);
router.delete("/users/:id", UserController.delete);

// Rotas para login
router.post("/users/login", UserController.login);

//Rotas para Categorias
router.get("/category", CategoryController.index);
router.post("/category", CategoryController.store);
router.get("/category/:id", CategoryController.show);
router.put("/category/:id", CategoryController.update);
router.delete("/category/:id", CategoryController.delete);

module.exports = router;
