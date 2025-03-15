require("dotenv").config();
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Personas",
      version: "1.0.0",
      description: "Documentación de la API con Swagger",
    },
    servers: [
      {
        url: process.env.SERVER_URL || "http://localhost:3000", // Usar la URL del entorno
      },
    ],
  },
  apis: ["./server.js"], // Especifica en qué archivo están los endpoints
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
