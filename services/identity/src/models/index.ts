import { Usuario } from './Usuario';
import { Rol } from './Rol';
import { UsuarioRol } from './UsuarioRol';

Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'id_usuario' });
Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'id_rol' });
Usuario.hasOne(UsuarioRol, { foreignKey: 'id_usuario' });
UsuarioRol.belongsTo(Usuario, { foreignKey: 'id_usuario' });

export { Usuario, Rol, UsuarioRol };
