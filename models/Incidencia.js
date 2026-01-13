const { sequelize, DataTypes } = require('../database/db_conection');
const Usuario = require('./Usuario');
const Aula = require('./Aula');
const Laboratorio = require('./Laboratorio');
const Equipo = require('./Equipo');

const Incidencia = sequelize.define('Incidencia', {
  id_incidencia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: DataTypes.STRING,
  descripcion: DataTypes.TEXT,
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'Reportado',
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'incidencia',
  timestamps: false,
});

Incidencia.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Incidencia.belongsTo(Aula, { foreignKey: 'id_aula' });
Incidencia.belongsTo(Laboratorio, { foreignKey: 'id_laboratorio' });
Incidencia.belongsTo(Equipo, { foreignKey: 'id_equipo' });

module.exports = Incidencia;
