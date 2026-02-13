const { sequelize, DataTypes } = require('../database/db_conection');

const Estudiante = sequelize.define('Estudiante', {
  id_estudiante: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombres: DataTypes.STRING,
  apellidos: DataTypes.STRING,
  tipo: {
    type: DataTypes.CHAR(1),
    allowNull: false,
  },
}, {
  tableName: 'estudiante',
  timestamps: false,
});

module.exports = Estudiante;
