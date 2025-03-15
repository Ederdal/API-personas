require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Verificar variables de entorno
//console.log(process.env);

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Personas",
      version: "1.0.0",
      description: "Documentación de la API para insertar personas, usuarios y asignar roles.",
    },
    servers: [
      {
        url: process.env.SERVER_URL || "http://localhost:3000",
      },
    ],
  },
  apis: ["./server.js"], // Especifica el archivo donde están los endpoints
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Conexión a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * @swagger
 * /insertar-personas:
 *   post:
 *     summary: Inserta personas en la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad:
 *                 type: integer
 *               genero:
 *                 type: string
 *                 nullable: true
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *               fechaFin:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Personas insertadas correctamente.
 *       500:
 *         description: Error al insertar personas.
 */
app.post("/insertar-personas", async (req, res) => {
  const { cantidad, genero, fechaInicio, fechaFin } = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query("CALL SP_InsertarPersonas(?, ?, ?, ?)", [
      cantidad,
      genero === "" ? null : genero,
      fechaInicio,
      fechaFin,
    ]);
    connection.release();
    res.json({ message: "Personas insertadas correctamente." });
  } catch (error) {
    console.error("Error en la base de datos:", error);
    if (connection) connection.release();
    res.status(500).json({ error: "Error al insertar personas", details: error.message });
  }
});

/**
 * @swagger
 * /insertar-usuario:
 *   post:
 *     summary: Inserta usuarios en la base de datos con un rol específico.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad:
 *                 type: integer
 *               tipo_usuario:
 *                 type: string
 *               edad_minima:
 *                 type: integer
 *               edad_maxima:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuarios insertados correctamente.
 *       500:
 *         description: Error al insertar usuarios.
 */
app.post("/insertar-usuario", async (req, res) => {
  const { cantidad, tipo_usuario, edad_minima, edad_maxima } = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query("CALL SP_InsertaUsuariosPersonas(?, ?, ?, ?)", [
      cantidad,
      tipo_usuario,
      edad_minima,
      edad_maxima,
    ]);
    connection.release();
    res.json({ message: "Usuarios insertados correctamente." });
  } catch (error) {
    console.error("Error en la base de datos:", error);
    if (connection) connection.release();
    res.status(500).json({ error: "Error al insertar usuarios", details: error.message });
  }
});


/**
 * @swagger
 * /asignar-roles:
 *   post:
 *     summary: Asigna roles a los usuarios.
 *     responses:
 *       200:
 *         description: Roles asignados correctamente.
 *       500:
 *         description: Error al asignar roles.
 */
app.post("/asignar-roles", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query("CALL SP_InsertaRolesPersonas()");
    connection.release();
    res.json({ message: "Roles asignados correctamente." });
  } catch (error) {
    console.error("Error en la base de datos:", error);
    if (connection) connection.release();
    res.status(500).json({ error: "Error al asignar roles", details: error.message });
  }
});


/**
 * @swagger
 * /limpiar-personas:
 *   delete:
 *     summary: Elimina todos los registros de la tabla de personas mediante un procedimiento almacenado.
 *     responses:
 *       200:
 *         description: Tabla de personas limpiada correctamente.
 *       500:
 *         description: Error al limpiar la tabla de personas.
 */
app.delete("/limpiar-personas", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query("CALL SP_LimpiarPersonas()"); // Llamada al procedimiento almacenado
    connection.release();
    res.json({ message: "Tabla de personas limpiada correctamente." });
  } catch (error) {
    console.error("Error en la base de datos:", error);
    if (connection) connection.release();
    res.status(500).json({ error: "Error al limpiar la tabla de personas", details: error.message });
  }
});







// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});