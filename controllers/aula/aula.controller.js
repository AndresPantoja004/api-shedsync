const Aula = require('../../models/Aula');
const Horario = require('../../models/Horario');

exports.getAll = async (req, res) => {
  try {
    const aulas = await Aula.findAll();
    res.json(aulas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDisponibles = async (req, res) => {
  try {
    const aulas = await Aula.findAll({
      include: {
        model: Horario,
        required: false,
      }
    });

    // lógica simple: si no tiene horario → disponible
    const disponibles = aulas.filter(a => a.Horarios?.length === 0);
    res.json(disponibles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
