const { Estudiante, Carrera, EstudianteSemestre, Semestre, Asignatura, TipoEstudiante } = require('../../models');

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
    console.log("USUARIO EN GET BY ID:" + req.user.id_usuario)
    const estudiante = await Estudiante.findOne({ where: { id_usuario: idUsuario } }, { include: Carrera });
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
    const data = await EstudianteSemestre.findAll({
      where: { id_estudiante: req.params.id },
      attributes: ['id_estudiante'],
      include: [
        {
          model: Semestre,
          attributes: ['id_semestre', 'nombre']
        },
        {
          model: Asignatura,
          attributes: ['id_asignatura', 'nombre']
        },
        {
          model: TipoEstudiante,
          attributes: ['id_tipoestu', 'descripcion']
        }
      ]
    });

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.asignarSemestre = async (req, res) => {
  try {
    const {id_tipoestu, asignaturas } = req.body;

    const data = asignaturas.map(item => ({
      id_estudiante: req.params.id,
      id_semestre: item.id_semestre,
      id_asignatura: item.id_asignatura,
      id_tipoestu
    }));

    console.log(req.body);
    console.log("ID ESTUDIANTE DESDE API: ", req.params.id)

    await EstudianteSemestre.bulkCreate(data);

    res.status(201).json({ msg: 'Asignaturas asignadas correctamente' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
