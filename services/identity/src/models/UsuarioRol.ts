const { sequelize, DataTypes } = require('../db');

const UsuarioRol = sequelize.define('UsuarioRol', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  id_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  tableName: 'usuario_rol',
  timestamps: false,
});

module.exports = UsuarioRol;