const { sequelize, DataTypes } = require('../database/db_conection');
const Usuario = require('./Usuario');
const Carrera = require('./Carrera');

const Estudiante = sequelize.define('Estudiante', {
  id_estudiante: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombres: DataTypes.STRING,
  apellidos: DataTypes.STRING,
  tipo: {
    type: DataTypes.CHAR(1),
    allowNull: false,
  },
}, {
  tableName: 'estudiante',
  timestamps: false,
});

Estudiante.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Estudiante.belongsTo(Carrera, { foreignKey: 'id_carrera' });

module.exports = Estudiante;
