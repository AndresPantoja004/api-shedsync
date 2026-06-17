const { sequelize, DataTypes } = require('../db');

const Incidencia = sequelize.define('Incidencia', {
  id_incidencia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipo: DataTypes.STRING,
  descripcion: DataTypes.TEXT,
  imagen: { type: DataTypes.TEXT('long'), allowNull: true }, // base64
  estado: { type: DataTypes.STRING, defaultValue: 'Reportado' },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  // Referencias LÓGICAS a otros contextos (antes eran FKs vía associations):
  id_usuario: { type: DataTypes.INTEGER, allowNull: true }, // -> identity
  id_espacio: { type: DataTypes.INTEGER, allowNull: true }, // -> espacios
  id_equipo: { type: DataTypes.INTEGER, allowNull: true },  // -> espacios (equipo)
}, { tableName: 'incidencia', timestamps: false });

module.exports = Incidencia;