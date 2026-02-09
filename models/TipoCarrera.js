const { sequelize, DataTypes } = require('../database/db_conection');

const TipoCarrera = sequelize.define('TipoCarrera', {
  id_tipo_carrera: {
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
  tableName: 'tipo_carrera',
  timestamps: false,
});

module.exports = TipoCarrera;
