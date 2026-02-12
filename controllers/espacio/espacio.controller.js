const { Horario, Equipo, Espacio, Reserva } = require('../../models');
const { Op } = require('sequelize');


exports.getAll = async (req, res) => {
  try {
    const { tipo } = req.query;

    const where = tipo ? { tipo } : {};

    const espacios = await Espacio.findAll({ where });
    res.json(espacios);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


exports.getDisponibles = async (req, res) => {
  try {
    const { tipo } = req.query;

    const now = new Date();

    const dias = [
      "DOMINGO",
      "LUNES",
      "MARTES",
      "MIERCOLES",
      "JUEVES",
      "VIERNES",
      "SABADO",
    ];

    const diaActual = dias[now.getDay()];
    const horaActual = now.toTimeString().slice(0, 8);
    const fechaActual = now.toISOString().slice(0, 10);

    // 1️⃣ Filtrar espacios por tipo si existe
    const whereEspacio = {};
    if (tipo) {
      whereEspacio.tipo = tipo;
    }

    const espacios = await Espacio.findAll({
      where: whereEspacio,
      include: [
        {
          model: Horario,
          where: { dia: diaActual },
          required: false,
        },
      ],
    });

    const resultado = [];

    for (const espacio of espacios) {
      const horariosProcesados = [];

      for (const h of espacio.Horarios || []) {
        // Buscar si existe reserva para ese bloque
        const reserva = await Reserva.findOne({
          where: {
            id_espacio: espacio.id_espacio,
            fecha: fechaActual,
            estado: "APROBADA", // <--- Cambiado de "ACTIVA" a "APROBADA"
            hora_inicio: h.hora_inicio,
            hora_fin: h.hora_fin,
          },
        });

        let estado = "DISPONIBLE";

        if (h.hora_fin <= horaActual) {
          estado = "PASADO";
        } else if (reserva) {
          estado = "OCUPADO";
        }

        horariosProcesados.push({
          id_horario: h.id_horario,
          dia: h.dia,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          estado,
        });
      }

      resultado.push({
        id_espacio: espacio.id_espacio,
        nombre: espacio.nombre,
        capacidad: espacio.capacidad,
        tipo: espacio.tipo,
        horarios: horariosProcesados,
      });
    }

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const espacio = await Espacio.findByPk(req.params.id);

    if (!espacio)
      return res.status(404).json({ msg: 'Espacio no encontrado' });

    res.json(espacio);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const espacio = await Espacio.create(req.body);
    res.status(201).json(espacio);

  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Espacio.update(req.body, {
      where: { id_espacio: req.params.id }
    });

    res.json({ msg: 'Espacio actualizado' });

  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Espacio.destroy({
      where: { id_espacio: req.params.id }
    });

    res.json({ msg: 'Espacio eliminado' });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getEquipos = async (req, res) => {
  try {
    const espacio = await Espacio.findByPk(req.params.id);

    if (!espacio)
      return res.status(404).json({ msg: 'Espacio no encontrado' });

    if (espacio.tipo !== 'LABORATORIO') {
      return res.status(400).json({
        msg: 'Este espacio no es un laboratorio'
      });
    }

    const equipos = await Equipo.findAll({
      where: { id_espacio: req.params.id }
    });

    res.json(equipos);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
