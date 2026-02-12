const express = require("express");
const router = express.Router();
const reservaController = require("../../controllers/reserva/reserva.controller");

// Crear reserva
router.post("/", reservaController.crearReserva);

// Obtener reservas por fecha
router.get("/", reservaController.obtenerReservasPorFecha);

// Cancelar reserva
router.put("/:id/cancelar", reservaController.cancelarReserva);

module.exports = router;