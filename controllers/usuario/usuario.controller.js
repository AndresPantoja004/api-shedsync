const Usuario = require('../../models/Usuario');
const Carrera = require('../../models/Carrera');
const Estudiante = require('../../models/Estudiante');
const EstudianteSemestre = require('../../models/EstudianteSemestre');
const Semestre = require('../../models/Semestre');

exports.getById = async (req, res) => {
  try {
    const idUsuario = req.user.id_usuario;
    console.log("USUARIO EN GET BY ID:"+ req.user.id_usuario)
    const usuario = await Usuario.findOne({where:{id_usuario: idUsuario}}, { include: [Estudiante, EstudianteSemestre, Semestre] });
    if (!usuario) return res.status(404).json({ msg: 'No encontrado' });
    res.json(usuario);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};