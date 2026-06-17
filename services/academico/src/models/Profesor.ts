const { sequelize, DataTypes } = require('../db');

const Profesor = sequelize.define('Profesor', {
  id_profesor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombres: DataTypes.STRING,
  apellidos: DataTypes.STRING,
  email: DataTypes.STRING,
  // Referencia LÓGICA al servicio identity (no es FK física).
  id_usuario: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'profesor', timestamps: false });

module.exports = Profesor;