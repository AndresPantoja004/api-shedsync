const { sequelize, DataTypes } = require('../db');

const Asignatura = sequelize.define('Asignatura', {
  id_asignatura: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: DataTypes.STRING,
  nrc: DataTypes.STRING,
}, {
  tableName: 'asignatura',
  timestamps: false,
});

module.exports = Asignatura;