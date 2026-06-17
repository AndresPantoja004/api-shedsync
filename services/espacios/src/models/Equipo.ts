const { sequelize, DataTypes } = require('../db');

const Equipo = sequelize.define('Equipo', {
  id_equipo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  codigo: DataTypes.STRING,
  estado: DataTypes.STRING,
  // id_espacio lo crea la asociación interna Espacio.hasMany(Equipo)
}, {
  tableName: 'equipo',
  timestamps: false,
});

module.exports = Equipo;