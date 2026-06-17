const { sequelize, DataTypes } = require('../db');

const Semestre = sequelize.define('Semestre', {
  id_semestre: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nivel: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  numero_asignaturas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'semestre',
  timestamps: false,
});

module.exports = Semestre;