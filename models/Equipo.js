const { sequelize, DataTypes } = require('../database/db_conection');
const Laboratorio = require('./Laboratorio');

const Equipo = sequelize.define('Equipo', {
  id_equipo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  codigo: DataTypes.STRING,
  estado: DataTypes.STRING,
}, {
  tableName: 'equipo',
  timestamps: false,
});

Equipo.belongsTo(Laboratorio, { foreignKey: 'id_laboratorio' });

module.exports = Equipo;
