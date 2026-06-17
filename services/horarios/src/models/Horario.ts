const { sequelize, DataTypes } = require('../db');

const Horario = sequelize.define('Horario', {
  id_horario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  dia: DataTypes.STRING,
  hora_inicio: DataTypes.TIME,
  hora_fin: DataTypes.TIME,
  // Referencias LÓGICAS a otros contextos (no FKs físicas):
  id_asignatura: { type: DataTypes.INTEGER, allowNull: true }, // -> academico
  id_espacio: { type: DataTypes.INTEGER, allowNull: true },    // -> espacios
}, { tableName: 'horario', timestamps: false });

module.exports = Horario;