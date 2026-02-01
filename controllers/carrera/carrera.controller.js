const Carrera = require('../../models/Carrera');
const TipoCarrera = require('../../models/TipoCarrera');

exports.getAll = async (req, res) => {
  try {
    const carreras = await Carrera.findAll({ include: TipoCarrera });
    res.json(carreras);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const carrera = await Carrera.findByPk(req.params.id, { include: TipoCarrera });
    if (!carrera) return res.status(404).json({ msg: 'Carrera no encontrada' });
    res.json(carrera);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const carrera = await Carrera.create(req.body);
    res.status(201).json(carrera);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Carrera.update(req.body, { where: { id_carrera: req.params.id } });
    res.json({ msg: 'Carrera actualizada' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Carrera.destroy({ where: { id_carrera: req.params.id } });
    res.json({ msg: 'Carrera eliminada' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
