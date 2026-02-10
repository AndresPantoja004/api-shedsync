const { sequelize, DataTypes } = require('../database/db_conection');

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
