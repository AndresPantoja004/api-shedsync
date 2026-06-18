import bcrypt from 'bcryptjs';
import { config } from './config';
import { Usuario, Rol, UsuarioRol } from './models';

// Reemplaza a database/seeds/seed_adminUser.js. Todo vive en el contexto identity
// (usuario / rol / usuario_rol), así que NO hay llamadas cross-context. Idempotente:
// se puede invocar varias veces sin duplicar ni resetear la contraseña.

const ROLES = [
  { id_rol: 1, nombre: 'Estudiante' },
  { id_rol: 2, nombre: 'Docente' },
  { id_rol: 3, nombre: 'Administrador' },
];

const ROL_ADMIN = 3;

export interface SeedResultado {
  roles: number;
  admin_email: string;
  admin_creado: boolean;
}

export async function seedAdmin(): Promise<SeedResultado> {
  // 1) Catálogo de roles (garantiza que exista id_rol = 3 que usa onlyAdmin).
  for (const r of ROLES) {
    await Rol.findOrCreate({ where: { id_rol: r.id_rol }, defaults: r });
  }

  // 2) Usuario admin (no reescribe la contraseña si ya existe).
  const password_hash = await bcrypt.hash(config.adminPass, 10);
  const [admin, creado] = await Usuario.findOrCreate({
    where: { email: config.adminEmail },
    defaults: { email: config.adminEmail, password_hash },
  });

  // 3) Asignación de rol admin.
  await UsuarioRol.findOrCreate({
    where: { id_usuario: admin.id_usuario, id_rol: ROL_ADMIN },
    defaults: { id_usuario: admin.id_usuario, id_rol: ROL_ADMIN },
  });

  return { roles: ROLES.length, admin_email: config.adminEmail, admin_creado: creado };
}
