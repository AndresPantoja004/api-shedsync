const Horario = require('../../models/Horario');
const Asignatura = require('../../models/Asignatura');

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
