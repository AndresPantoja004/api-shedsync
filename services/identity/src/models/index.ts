const Usuario = require('./Usuario');
const Rol = require('./Rol');
const UsuarioRol = require('./UsuarioRol');

Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'id_usuario' });
Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'id_rol' });
Usuario.hasOne(UsuarioRol, { foreignKey: 'id_usuario' });
UsuarioRol.belongsTo(Usuario, { foreignKey: 'id_usuario' });

module.exports = { Usuario, Rol, UsuarioRol };