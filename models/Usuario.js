const { sequelize, DataTypes } = require('../database/db_conection');

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'usuario',
  timestamps: false,
});

module.exports = Usuario;
