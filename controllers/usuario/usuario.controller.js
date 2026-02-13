const Usuario = require('../../models/Usuario');
const Carrera = require('../../models/Carrera');
const Estudiante = require('../../models/Estudiante');
const EstudianteSemestre = require('../../models/EstudianteSemestre');
const Semestre = require('../../models/Semestre');
const UsuarioRol = require('../../models/UsuarioRol')
const Rol = require('../../models/Rol')

exports.getById = async (req, res) => {
  try {
    const idUsuario = req.user.id_usuario;

    const usuario = await Usuario.findOne({
      where: { id_usuario: idUsuario },
      include: [
        {
          model: Estudiante,
          include: [Carrera] // Trae el nombre de la carrera
        },
        {
          model: EstudianteSemestre,
          include: [Semestre] // Trae el semestre actual
        }
      ]
    });

    if (!usuario) return res.status(404).json({ msg: 'No encontrado' });

    res.json(usuario);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


//Actaulizar datos:
// exports.updatePerfil en tu auth.controller.js

exports.updatePerfil = async (req, res) => {
  try {
    const idUsuario = req.user.id_usuario; // Obtenido del token
    const { avatar, phone } = req.body;

    // Buscar el usuario
    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Preparar datos para actualización
    const datosActualizar = {};

    if (avatar) {
      datosActualizar.avatar = avatar; // String Base64
    }

    if (phone) {
      // Limpiamos el número por si tiene símbolos
      datosActualizar.phone = phone.replace(/\D/g, '');
    }

    // Actualizar en la base de datos
    await usuario.update(datosActualizar);

    res.json({
      msg: 'Perfil actualizado correctamente',
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        phone: usuario.phone,
        avatar: usuario.avatar // Enviamos el nuevo avatar de vuelta
      }
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.asignarRol = async (req, res) => {
  try {
    const id_usuario = req.params.id; // ✅ CORRECTO
    const { id_rol } = req.body;

    if (!id_rol) {
      return res.status(400).json({ msg: 'El id_rol es obligatorio' });
    }

    const usuario = await Usuario.findByPk(id_usuario);
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const rol = await Rol.findByPk(id_rol);
    if (!rol) {
      return res.status(404).json({ msg: 'Rol no encontrado' });
    }

    const existe = await UsuarioRol.findOne({
      where: { id_usuario, id_rol },
    });

    if (existe) {
      return res
        .status(409)
        .json({ msg: 'El usuario ya tiene este rol asignado' });
    }

    const usuarioRol = await UsuarioRol.create({
      id_usuario,
      id_rol,
    });

    res.status(201).json({
      msg: 'Rol asignado correctamente',
      data: usuarioRol,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};