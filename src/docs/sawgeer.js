const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Drip Stores API",
      version: "1.0.0",
      description: "Documentação da API Drip Stores",
    },
    tags: [
      { name: "Login", description: "Endpoints de login" },
      { name: "Users", description: "Gerenciamento de usuários" },
      { name: "Categories", description: "Gerenciamento de categorias" },
      { name: "Products", description: "Gerenciamento de produtos" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.resolve(__dirname, "../controllers/*.js"),
    path.resolve(__dirname, "../config/*.js"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
