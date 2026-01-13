const { sequelize, DataTypes } = require('../database/db_conection');

const Laboratorio = sequelize.define('Laboratorio', {
  id_laboratorio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: DataTypes.STRING,
  capacidad: DataTypes.INTEGER,
  tipo: DataTypes.STRING,
}, {
  tableName: 'laboratorio',
  timestamps: false,
});

module.exports = Laboratorio;
