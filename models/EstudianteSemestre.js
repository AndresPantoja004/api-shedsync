const { sequelize, DataTypes } = require('../database/db_conection');

const EstudianteSemestre = sequelize.define('EstudianteSemestre', {
  id_estudiante: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  id_semestre: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  tableName: 'estudiante_semestre',
  timestamps: false,
});

module.exports = EstudianteSemestre;
