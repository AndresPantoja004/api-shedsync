import type { Request, Response } from 'express';
import { config } from '../config';
import { Usuario, Rol, UsuarioRol } from '../models';

// Trae los datos académicos del usuario desde el contexto academico.
// Si el usuario no es estudiante (404) o academico no responde, null.
async function fetchEstudiante(id_usuario: number): Promise<any | null> {
  try {
    const r = await fetch(`${config.academicoUrl}/api/estudiante/by-usuario/${id_usuario}`);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

// GET /api/usuario (auth): usuario autenticado + sus datos académicos (composición HTTP).
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const id_usuario = req.user!.id_usuario;

    const usuario = await Usuario.findByPk(id_usuario, {
      attributes: ['id_usuario', 'email', 'phone', 'avatar', 'activo'],
    });
    if (!usuario) {
      res.status(404).json({ msg: 'Usuario no encontrado' });
      return;
    }

    // Estudiante/Carrera viven en academico: se componen vía HTTP (o null).
    const estudiante = await fetchEstudiante(id_usuario);

    res.json({ ...usuario.toJSON(), Estudiante: estudiante ?? null });
  } catch (error) {
    console.error('Error en getById:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// POST /api/usuario/:id/asignar-rol (sin auth): asigna un rol a un usuario.
export async function asignarRol(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { id_rol } = req.body ?? {};

    if (!id_rol) {
      res.status(400).json({ msg: 'El id_rol es obligatorio' });
      return;
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      res.status(404).json({ msg: 'Usuario no encontrado' });
      return;
    }

    const rol = await Rol.findByPk(id_rol);
    if (!rol) {
      res.status(404).json({ msg: 'Rol no encontrado' });
      return;
    }

    const id_usuario = usuario.id_usuario;
    const existente = await UsuarioRol.findOne({ where: { id_usuario, id_rol } });
    if (existente) {
      res.status(409).json({ msg: 'El usuario ya tiene este rol asignado' });
      return;
    }

    const usuarioRol = await UsuarioRol.create({ id_usuario, id_rol });
    res.status(201).json({ msg: 'Rol asignado correctamente', data: usuarioRol });
  } catch (error) {
    console.error('Error en asignarRol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// PUT /api/usuario/perfil (auth): actualiza avatar y/o phone del usuario autenticado.
export async function updatePerfil(req: Request, res: Response): Promise<void> {
  try {
    const id_usuario = req.user!.id_usuario;
    const { avatar, phone } = req.body ?? {};

    const usuario = await Usuario.findByPk(id_usuario);
    if (!usuario) {
      res.status(404).json({ msg: 'Usuario no encontrado' });
      return;
    }

    if (avatar !== undefined) usuario.avatar = avatar;
    if (phone !== undefined) usuario.phone = String(phone).replace(/\D/g, '');

    await usuario.save();

    res.json({
      msg: 'Perfil actualizado correctamente',
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        phone: usuario.phone,
        avatar: usuario.avatar,
      },
    });
  } catch (error) {
    console.error('Error en updatePerfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
