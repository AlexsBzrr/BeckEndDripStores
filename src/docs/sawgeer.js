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
      { name: "Category", description: "Gerenciamento de categorias" },
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
  apis: ["../src/config/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
