const { Horario, Asignatura, EstudianteSemestre } = require('../../models');

exports.getByEstudiante = async (req, res) => {
  try {
    const horarios = await Horario.findAll({
      include: [{
        model: Asignatura,
        where: { id_estudiante: req.params.id }
      }]
    });
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSemanal = async (req, res) => {
  try {
    const horarios = await Horario.findAll({
      include: [Asignatura],
      order: [['dia', 'ASC'], ['hora_inicio', 'ASC']]
    });
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerHorarioEstudiante = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Obtener asignaturas del estudiante
    const registros = await EstudianteSemestre.findAll({
      where: { id_estudiante: id },
      attributes: ['id_asignatura']
    });

    if (!registros.length) {
      return res.status(404).json({ msg: 'El estudiante no tiene asignaturas registradas' });
    }

    const idsAsignaturas = registros.map(r => r.id_asignatura);

    // 2️⃣ Buscar horarios de esas asignaturas
    const horarios = await Horario.findAll({
      where: {
        id_asignatura: idsAsignaturas
      },
      include: [
        {
          model: Asignatura,
          attributes: ['nombre']
        }
      ],
      order: [['dia', 'ASC'], ['hora_inicio', 'ASC']]
    });

    res.json(horarios);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
