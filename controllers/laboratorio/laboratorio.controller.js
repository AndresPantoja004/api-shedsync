const Laboratorio = require('../../models/Laboratorio');
const Equipo = require('../../models/Equipo');
const Horario = require('../../models/Horario');

exports.getAll = async (req, res) => {
  try {
    const labs = await Laboratorio.findAll();
    res.json(labs);
  } catch (e) {
    res.status(500).json({ error: e.message });
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

exports.getDisponibles = async (req, res) => {
  try {
    const labs = await Laboratorio.findAll({
      include: { model: Horario, required: false }
    });
    const disponibles = labs.filter(l => l.Horarios?.length === 0);
    res.json(disponibles);
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
