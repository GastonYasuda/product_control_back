
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta para comprobar la conexión
app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT NOW() AS fecha, current_database() AS base"
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error de PostgreSQL:", error.message);
        res.status(500).json({
            error: "No se pudo consultar PostgreSQL",
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
