const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../../models/Usuario');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
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
      return res.status(400).json({
        message: 'Email y contraseña son obligatorios',
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        message: 'Usuario deshabilitado',
      });
    }

    // Comparar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
      });
    }

    // Crear token
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
      },
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};
