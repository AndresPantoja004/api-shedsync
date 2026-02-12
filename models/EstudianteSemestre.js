const { sequelize, DataTypes } = require('../database/db_conection');

const EstudianteSemestre = sequelize.define('EstudianteSemestre', {
  id_estudiante_semestre: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_estudiante: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_semestre: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_asignatura: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_tipoestu: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'estudiante_semestre',
  timestamps: false,
});

module.exports = EstudianteSemestre;
