const { sequelize, DataTypes } = require('../database/db_conection');

const Espacio = sequelize.define('Espacio', {
  id_espacio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: DataTypes.STRING,
  tipo: {
    type: DataTypes.ENUM('AULA', 'LABORATORIO', "VIRTUAL", "OTRO"),
    allowNull: false
  },
  capacidad: DataTypes.INTEGER,
}, {
  tableName: 'espacio',
  timestamps: false,
});

module.exports = Espacio;