const { Incidencia } = require('../../models');
const { Op } = require('sequelize');

exports.create = async (req, res) => {
  try {
    const {tipo, descripcion, estado, id_aula, id_laboratorio, id_equipo} = req.body;
    const id_usuario = req.user.id_usuario;

    const result = await Incidencia.create({tipo, descripcion, estado, id_usuario, id_aula, id_laboratorio, id_equipo});
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAulaCount = async (req, res) => {
  try {

    const aulas = await Incidencia.count({
      col: 'id_aula',
      where: {
        id_aula: { [Op.ne]: null }
      },
      group: ['id_aula']
    });

    res.json(aulas);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLabCount = async (req, res) => {
  try {

    const laboratorios = await Incidencia.count({
      col: 'id_laboratorio',
      where: {
        id_laboratorio: { [Op.ne]: null }
      },
      group: ['id_laboratorio']
    });

    res.json(laboratorios);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const incidencia = await Incidencia.findByPk(req.params.id)

    res.json(incidencia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
