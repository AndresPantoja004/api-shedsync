const { sequelize, DataTypes } = require('../db');

const Carrera = sequelize.define('Carrera', {
  id_carrera: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  duracion_anios: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_semestres: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'carrera',
  timestamps: false,
});

module.exports = Carrera;