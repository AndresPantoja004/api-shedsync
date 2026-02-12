const { Incidencia, Espacio } = require('../../models');
const { Op, Sequelize } = require('sequelize');

exports.create = async (req, res) => {
  try {
    const { tipo, descripcion, estado, id_espacio, id_equipo } = req.body;
    const id_usuario = req.user.id_usuario;

    const result = await Incidencia.create({
      tipo,
      descripcion,
      estado,
      id_usuario,
      id_espacio,
      id_equipo
    });

    res.status(201).json(result);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCountByTipo = async (req, res) => {
  try {
    const { tipo } = req.query;

    const incidencias = await Incidencia.findAll({
      attributes: [
        [Sequelize.col('Incidencia.id_espacio'), 'id_espacio'],
        [Sequelize.fn('COUNT', Sequelize.col('Incidencia.id_incidencia')), 'total']
      ],
      include: [{
        model: Espacio,
        attributes: ['tipo'],
        where: tipo ? { tipo } : {}
      }],
      where: {
        id_espacio: { [Op.ne]: null }
      },
      group: [
        'Incidencia.id_espacio',
        'Espacio.id_espacio',
        'Espacio.tipo'
      ]
    });

    res.json(incidencias);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const incidencia = await Incidencia.findByPk(req.params.id, {
      include: [{ model: Espacio }]
    });

    if (!incidencia)
      return res.status(404).json({ msg: 'Incidencia no encontrada' });

    res.json(incidencia);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
