const { sequelize, DataTypes } = require('../db');

const TipoEstudiante = sequelize.define('TipoEstudiante', {
  id_tipoestu: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'tipo_estudiante',
  timestamps: false,
});

module.exports = TipoEstudiante;