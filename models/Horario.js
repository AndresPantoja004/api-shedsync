const { sequelize, DataTypes } = require('../database/db_conection');
const Asignatura = require('./Asignatura');
const Aula = require('./Aula');
const Laboratorio = require('./Laboratorio');

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

Horario.belongsTo(Asignatura, { foreignKey: 'id_asignatura' });
Horario.belongsTo(Aula, { foreignKey: 'id_aula' });
Horario.belongsTo(Laboratorio, { foreignKey: 'id_laboratorio' });

module.exports = Horario;
