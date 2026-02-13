const { sequelize, DataTypes } = require('../database/db_conection');

const Horario = sequelize.define('Horario', {
  id_horario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dia: DataTypes.STRING,
  hora_inicio: DataTypes.TIME,
  hora_fin: DataTypes.TIME,
}, {
  tableName: 'horario',
  timestamps: false,
});

module.exports = Horario;
