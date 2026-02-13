const { sequelize, DataTypes } = require('../database/db_conection');

const Incidencia = sequelize.define('Incidencia', {
  id_incidencia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: DataTypes.STRING,
  descripcion: DataTypes.TEXT,
  // NUEVO CAMPO PARA LA IMAGEN
  imagen: {
    type: DataTypes.TEXT('long'), // Permite guardar strings de hasta 4GB (en MySQL)
    allowNull: true,
  },
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
