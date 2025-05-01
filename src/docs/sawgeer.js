const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Drip Stores API",
      version: "1.0.0",
      description: "Documentação da API Drip Stores",
    },
  },
  apis: ["../src/config/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
