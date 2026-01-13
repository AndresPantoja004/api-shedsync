const { sequelize, DataTypes } = require('../database/db_conection');

const Rol = sequelize.define('Rol', {
  id_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'rol',
  timestamps: false,
});

module.exports = Rol;
