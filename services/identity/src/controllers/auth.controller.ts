import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Usuario, UsuarioRol } from '../models';

const SALT_ROUNDS = 10;

// Trae los datos académicos del usuario desde el contexto academico.
// Si el usuario no es estudiante (p. ej. admin) o academico no responde, null.
async function fetchEstudiante(id_usuario: number): Promise<any | null> {
  try {
    const r = await fetch(`${config.academicoUrl}/api/estudiante/by-usuario/${id_usuario}`);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, phone } = req.body ?? {};
    if (!email || !password || !phone) {
      res.status(400).json({ message: 'Email, contraseña y teléfono son obligatorios' });
      return;
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      res.status(409).json({ message: 'El usuario ya existe' });
      return;
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const usuario = await Usuario.create({ email, password_hash, phone });

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email },
      config.jwtSecret,
      { expiresIn: '24h' },
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      usuario: { id_usuario: usuario.id_usuario, email: usuario.email },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son obligatorios' });
      return;
    }

    // El rol vive en este mismo contexto (usuario_rol); los datos del estudiante NO.
    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ model: UsuarioRol, attributes: ['id_rol'] }],
    });

    if (!usuario) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }
    if (!usuario.activo) {
      res.status(403).json({ message: 'Usuario deshabilitado' });
      return;
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const id_rol = (usuario as any).UsuarioRol?.id_rol;

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email, rol: id_rol },
      config.jwtSecret,
      { expiresIn: '44h' },
    );

    // Composición síncrona con academico (en el monolito era un JOIN).
    const estudiante = await fetchEstudiante(usuario.id_usuario);

    res.status(200).json({
      message: 'Login exitoso',
      token,
      usuario: {
        avatar: usuario.avatar,
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        rol: id_rol,
        phone: usuario.phone || 'Sin numero telefonico',
        nombres: estudiante?.nombres,
        apellidos: estudiante?.apellidos,
        tipo: estudiante?.tipo,
        id_estudiante: estudiante?.id_estudiante,
        carrera: estudiante?.Carrera?.nombre || 'Carrera no asignada',
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
