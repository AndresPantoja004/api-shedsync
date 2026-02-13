const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario, UsuarioRol, Rol, Estudiante,Carrera } = require('../../models');


const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    if (!email || !password || !phone) {
      return res.status(400).json({
        message: 'Email y contraseña son obligatorios',
      });
    }

    // Verificar si el usuario ya existe
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(409).json({
        message: 'El usuario ya existe',
      });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Crear usuario
    const usuario = await Usuario.create({
      email,
      password_hash: passwordHash,
      phone,
    });

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
      },
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    // Buscamos el usuario e incluimos toda la información relacionada
    const usuario = await Usuario.findOne({
      where: { email },
      include: [
        {
          model: UsuarioRol,
          attributes: ['id_rol']
        },
        {
          model: Estudiante,
          attributes: ['id_estudiante', 'nombres', 'apellidos', 'tipo'],
          include: [
            {
              model: Carrera,
              attributes: ['nombre'] // Traemos el nombre de la carrera
            }
          ]
        }
      ]
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ message: 'Usuario deshabilitado' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generamos el token con el ID del usuario y su Rol
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        rol: usuario.UsuarioRol?.id_rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: '44h' }
    );

    // Estructuramos la respuesta con toda la data académica
    return res.status(200).json({
      message: 'Login exitoso',
      token,
      usuario: {
        avatar:usuario?.avatar,
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        rol: usuario.UsuarioRol?.id_rol,
        phone: usuario?.phone || 'Sin numero telefonico',
        // Datos extraídos de la tabla Estudiante y Carrera
        nombres: usuario.Estudiante?.nombres,
        apellidos: usuario.Estudiante?.apellidos,
        tipo: usuario.Estudiante?.tipo,
        id_estudiante: usuario.Estudiante?.id_estudiante,
        carrera: usuario.Estudiante?.Carrera?.nombre || "Carrera no asignada"
      },
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
