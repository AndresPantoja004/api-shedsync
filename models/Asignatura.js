const { sequelize, DataTypes } = require('../database/db_conection');
const Semestre = require('./Semestre');
const Profesor = require('./Profesor');

const Asignatura = sequelize.define('Asignatura', {
  id_asignatura: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: DataTypes.STRING,
  nrc: DataTypes.STRING,
  creditos: DataTypes.INTEGER,
}, {
  tableName: 'asignatura',
  timestamps: false,
});

Asignatura.belongsTo(Semestre, { foreignKey: 'id_semestre' });
Asignatura.belongsTo(Profesor, { foreignKey: 'id_profesor' });

module.exports = Asignatura;
