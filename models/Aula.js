const { sequelize, DataTypes } = require('../database/db_conection');
const Aula = sequelize.define('Aula', {
  id_aula: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  codigo: DataTypes.STRING,
  capacidad: DataTypes.INTEGER,
  tipo: DataTypes.STRING,
}, {
  tableName: 'aula',
  timestamps: false,
});

module.exports = Aula;
