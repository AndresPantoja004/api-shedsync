const { sequelize, DataTypes } = require('../db');

const Estudiante = sequelize.define('Estudiante', {
  id_estudiante: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombres: DataTypes.STRING,
  apellidos: DataTypes.STRING,
  tipo: { type: DataTypes.CHAR(1), allowNull: false },
  // Referencia LÓGICA al servicio identity (no es FK física).
  id_usuario: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'estudiante', timestamps: false });

module.exports = Estudiante;