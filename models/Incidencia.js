const { sequelize, DataTypes } = require('../database/db_conection');

const Incidencia = sequelize.define('Incidencia', {
  id_incidencia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: DataTypes.STRING,
  descripcion: DataTypes.TEXT,
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'Reportado',
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'incidencia',
  timestamps: false,
});

module.exports = Incidencia;
