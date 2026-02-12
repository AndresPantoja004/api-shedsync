const { Horario, Asignatura, EstudianteSemestre, Espacio } = require('../../models');

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

    const horarios = await Horario.findAll({
      include: [
        {
          model: Asignatura,
          attributes: ['nombre'],
          required: true,
          include: [
            {
              model: EstudianteSemestre,
              where: { id_estudiante: id },
              attributes: []
            }
          ]
        },
        {
          model: Espacio,
          attributes: ['nombre', 'tipo', 'capacidad']
        }
      ],
      order: [
        ['dia', 'ASC'],
        ['hora_inicio', 'ASC']
      ]
    });

    // 🔥 ELIMINAR DUPLICADOS
    const unique = [];
    const seen = new Set();

    for (const h of horarios) {
      const key = `${h.dia}-${h.hora_inicio}-${h.hora_fin}-${h.id_asignatura}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(h);
      }
    }

    const ordenDias = {
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6
    };

    unique.sort((a, b) => {
      if (ordenDias[a.dia] !== ordenDias[b.dia]) {
        return ordenDias[a.dia] - ordenDias[b.dia];
      }
      return a.hora_inicio.localeCompare(b.hora_inicio);
    });

    res.json(unique);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};