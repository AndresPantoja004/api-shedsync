const { Horario, Equipo, Espacio, Reserva } = require('../../models');
const { Op } = require('sequelize');

const dias = [
  'DOMINGO',
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO'
];

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

    const diaActual = dias[now.getDay()];
    const horaActual = now.toTimeString().slice(0, 8);

    const espaciosOcupados = await Horario.findAll({
      attributes: ['id_espacio'],
      where: {
        dia: diaActual,
        hora_inicio: { [Op.lte]: horaActual },
        hora_fin: { [Op.gt]: horaActual }
      },
      group: ['id_espacio']
    });

    const idsOcupados = espaciosOcupados.map(h => h.id_espacio);

    const where = {
      id_espacio: idsOcupados.length
        ? { [Op.notIn]: idsOcupados }
        : { [Op.ne]: null }
    };

    if (tipo) {
      where.tipo = tipo;
    }

    const disponibles = await Espacio.findAll({ where });

    res.json(disponibles);

  } catch (error) {
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

exports.reservar = async (req, res) => {
  try {
    const { id_espacio, hora_inicio, hora_fin } = req.body;
    const id_usuario = req.user.id_usuario;
    const fecha = new Date(req.body.fecha);

    if (hora_inicio >= hora_fin) {
      return res.status(400).json({ error: "Rango de horas inválido" });
    }

    const conflictoHorario = await Horario.findOne({
      where: {
        id_espacio,
        dia: dias[fecha.getUTCDay()],
        hora_inicio: { [Op.lt]: hora_fin },
        hora_fin: { [Op.gt]: hora_inicio }
      }
    });

    if (conflictoHorario) {
      return res.status(400).json({ error: "Conflicto con horario fijo" });
    }

    const conflictoReserva = await Reserva.findOne({
      where: {
        id_espacio,
        fecha,
        estado: { [Op.ne]: 'CANCELADA' },
        hora_inicio: { [Op.lt]: hora_fin },
        hora_fin: { [Op.gt]: hora_inicio }
      }
    });

    if (conflictoReserva) {
      return res.status(400).json({ error: "Ya existe una reserva en ese rango" });
    }

    const reserva = await Reserva.create({
      id_espacio,
      fecha,
      hora_inicio,
      hora_fin,
      estado: 'PENDIENTE',
      id_usuario
    });

    res.status(201).json(reserva);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEstadoReserva = async (req, res) => {
  const t = await Reserva.sequelize.transaction();

  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['APROBADA', 'CANCELADA'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        msg: 'Estado inválido. Solo se permite APROBADA o CANCELADA'
      });
    }

    const reserva = await Reserva.findByPk(id, { transaction: t });

    if (!reserva) {
      await t.rollback();
      return res.status(404).json({ msg: 'Reserva no encontrada' });
    }

    if (reserva.estado !== 'PENDIENTE') {
      await t.rollback();
      return res.status(400).json({
        msg: 'Solo se pueden modificar reservas en estado PENDIENTE'
      });
    }

    if (estado === 'APROBADA') {
      const conflicto = await Reserva.findOne({
        where: {
          id_espacio: reserva.id_espacio,
          fecha: reserva.fecha,
          estado: 'APROBADA',
          hora_inicio: { [Op.lt]: reserva.hora_fin },
          hora_fin: { [Op.gt]: reserva.hora_inicio }
        },
        transaction: t
      });

      if (conflicto) {
        await t.rollback();
        return res.status(409).json({
          msg: 'Conflicto de horario. Ya existe una reserva aprobada en ese rango.'
        });
      }

      reserva.fecha_aprobacion = new Date();
      reserva.aprobado_por = req.user.id_usuario;
    }

    reserva.estado = estado;
    await reserva.save({ transaction: t });

    await t.commit();

    res.json({
      msg: `Reserva ${estado} correctamente`,
      reserva
    });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.getPendientes = async (req, res) => {
  try {

    const reservas = await Reserva.findAll({
      where: { estado: 'PENDIENTE' },
      order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
    });

    res.json(reservas);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};