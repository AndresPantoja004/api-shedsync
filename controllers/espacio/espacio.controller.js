const { Horario, Equipo, Espacio } = require('../../models');
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
      'DOMINGO',
      'LUNES',
      'MARTES',
      'MIERCOLES',
      'JUEVES',
      'VIERNES',
      'SABADO'
    ];

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
