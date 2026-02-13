const { Reserva } = require("../../models");
const { Op } = require("sequelize");

/**
 * Crear reserva
 */
exports.crearReserva = async (req, res) => {
  try {
    const { id_espacio, fecha, hora_inicio, hora_fin } = req.body;

    if (!id_espacio || !fecha || !hora_inicio || !hora_fin) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios",
      });
    }

    // 🔥 Verificar cruce de horarios
    const reservaExistente = await Reserva.findOne({
      where: {
        id_espacio,
        fecha,
        estado: "APROBADA", // cambia según tu enum
        [Op.or]: [
          {
            hora_inicio: {
              [Op.between]: [hora_inicio, hora_fin],
            },
          },
          {
            hora_fin: {
              [Op.between]: [hora_inicio, hora_fin],
            },
          },
          {
            [Op.and]: [
              { hora_inicio: { [Op.lte]: hora_inicio } },
              { hora_fin: { [Op.gte]: hora_fin } },
            ],
          },
        ],
      },
    });

    if (reservaExistente) {
      return res.status(400).json({
        error: "El espacio ya está reservado en ese horario",
      });
    }

    const nuevaReserva = await Reserva.create({
      id_espacio,
      fecha,
      hora_inicio,
      hora_fin,
      estado: "PENDIENTE", // ajusta según tu enum
    });

    res.status(201).json(nuevaReserva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener reservas por fecha
 */
exports.obtenerReservasPorFecha = async (req, res) => {
  try {
    const { fecha } = req.query;

    const reservas = await Reserva.findAll({
      where: { fecha },
      order: [["hora_inicio", "ASC"]],
    });

    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cancelar reserva
 */
exports.cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    const reserva = await Reserva.findByPk(id);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    reserva.estado = "CANCELADA"; // según tu enum
    await reserva.save();

    res.json({ msg: "Reserva cancelada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};