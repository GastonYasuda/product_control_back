
require("dotenv").config();
import prisma from "./prisma-db.js";

const express = require("express");
const cors = require("cors");

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta para comprobar la conexión
app.get("/", (req, res) => {
    res.send("Backend funcionando con Prisma");
});


app.get("/db-test", async (req, res) => {
    try {
        const result = await prisma.$queryRaw`
      SELECT
        current_database() AS base,
        current_user AS usuario
    `;

        res.json(result[0]);
    } catch (error) {
        console.error("Error de PostgreSQL:", error.message);

        res.status(500).json({
            error: "No se pudo consultar la base de datos",
        });
    }
});

// Ejemplo: obtener productos
app.get("/products", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM products ORDER BY product_id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            error: "Error al obtener los productos",
        });
    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

