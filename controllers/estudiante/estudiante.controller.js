const { Estudiante, Carrera, EstudianteSemestre, Semestre } = require('../../models');

exports.getAll = async (req, res) => {
  try {
    console.log('USUARIO AUTENTICADO:', req.user);
    const estudiantes = await Estudiante.findAll({ include: Carrera });
    res.json(estudiantes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const idUsuario = req.user.id_usuario;
    console.log("USUARIO EN GET BY ID:"+ req.user.id_usuario)
    const estudiante = await Estudiante.findOne({where:{id_usuario: idUsuario}}, { include: Carrera });
    if (!estudiante) return res.status(404).json({ msg: 'No encontrado' });
    res.json(estudiante);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const estudiante = await Estudiante.create(req.body);
    res.status(201).json(estudiante);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Estudiante.update(req.body, { where: { id_estudiante: req.params.id } });
    res.json({ msg: 'Estudiante actualizado' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getSemestres = async (req, res) => {
  try {
    const semestres = await EstudianteSemestre.findAll({
      where: { id_estudiante: req.params.id },
      include: Semestre
    });
    res.json(semestres);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.asignarSemestre = async (req, res) => {
  try {
    const { id_semestre } = req.body;
    await EstudianteSemestre.create({
      id_estudiante: req.params.id,
      id_semestre
    });
    res.json({ msg: 'Semestre asignado' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
