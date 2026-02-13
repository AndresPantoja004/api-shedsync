const { sequelize, DataTypes } = require('../database/db_conection');

const Reserva = sequelize.define('Reserva', {
  id_reserva: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_espacio: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'APROBADA', 'CANCELADA'),
    defaultValue: 'PENDIENTE'
  }
},{
  tableName: 'reserva',
  timestamps: false,
});


module.exports = Reserva;