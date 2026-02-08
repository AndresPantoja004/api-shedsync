const { Incidencia } = require('../../models');

exports.create = async (req, res) => {
  try {
    const incidencia = await Incidencia.create(req.body);
    res.status(201).json(incidencia);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getReporte = async (req, res) => {
  try {
    const reporte = await Incidencia.findAll({
      attributes: ['id_aula', 'id_laboratorio', [Incidencia.sequelize.fn('COUNT', '*'), 'total']],
      group: ['id_aula', 'id_laboratorio']
    });
    res.json(reporte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCriticas = async (req, res) => {
  try {
    const criticas = await Incidencia.findAll({
      where: {
        estado: 'Reportado'
      },
      having: Incidencia.sequelize.literal('COUNT(*) >= 3'),
      group: ['id_aula', 'id_laboratorio']
    });

    res.json(criticas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
