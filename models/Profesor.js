const { sequelize, DataTypes } = require('../database/db_conection');

const Profesor = sequelize.define('Profesor', {
  id_profesor: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombres: DataTypes.STRING,
  apellidos: DataTypes.STRING,
  email: DataTypes.STRING,
}, {
  tableName: 'profesor',
  timestamps: false,
});

module.exports = Profesor;
