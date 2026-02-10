const { Horario, Equipo, Laboratorio } = require('../../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const labs = await Laboratorio.findAll();
    res.json(labs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getDisponibles = async (req, res) => {
  try {
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

    const labsOcupados = await Horario.findAll({
      attributes: ['id_laboratorio'],
      where: {
        dia: diaActual,
        id_laboratorio: { [Op.ne]: null },
        hora_inicio: { [Op.lte]: horaActual },
        hora_fin: { [Op.gt]: horaActual }
      },
      group: ['id_laboratorio']
    });

    const idsOcupadas = labsOcupados.map(h => h.id_laboratorio);

    const labsDisponibles = await Laboratorio.findAll({
      where: {
        id_laboratorio: idsOcupadas.length
          ? { [Op.notIn]: idsOcupadas }
          : { [Op.ne]: null }
      }
    });

    res.json(labsDisponibles);;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const lab = await Laboratorio.findByPk(req.params.id);
    if (!lab) return res.status(404).json({ msg: 'Laboratorio no encontrado' });
    res.json(lab);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const lab = await Laboratorio.create(req.body);
    res.status(201).json(lab);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Laboratorio.update(req.body, { where: { id_laboratorio: req.params.id } });
    res.json({ msg: 'Laboratorio actualizado' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Laboratorio.destroy({ where: { id_laboratorio: req.params.id } });
    res.json({ msg: 'Laboratorio eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getEquipos = async (req, res) => {
  try {
    const equipos = await Equipo.findAll({
      where: { id_laboratorio: req.params.id }
    });
    res.json(equipos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
