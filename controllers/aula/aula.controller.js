const { Horario, Aula } = require('../../models');
const { Op } = require('sequelize');

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

    const aulasOcupadas = await Horario.findAll({
      attributes: ['id_aula'],
      where: {
        dia: diaActual,
        id_aula: { [Op.ne]: null },
        hora_inicio: { [Op.lte]: horaActual },
        hora_fin: { [Op.gt]: horaActual }
      },
      group: ['id_aula']
    });

    const idsOcupadas = aulasOcupadas.map(h => h.id_aula);

    const aulasDisponibles = await Aula.findAll({
      where: {
        id_aula: idsOcupadas.length
          ? { [Op.notIn]: idsOcupadas }
          : { [Op.ne]: null }
      }
    });

    res.json(aulasDisponibles);;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
