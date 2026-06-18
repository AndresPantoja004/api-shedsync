import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class Reserva extends Model<InferAttributes<Reserva>, InferCreationAttributes<Reserva>> {
  declare id_reserva: CreationOptional<number>;
  declare id_espacio: number;
  declare fecha: string;
  declare hora_inicio: string;
  declare hora_fin: string;
  declare estado: CreationOptional<'PENDIENTE' | 'APROBADA' | 'CANCELADA'>;
  declare id_usuario: CreationOptional<number | null>;       // ref lógica a identity
  declare fecha_aprobacion: CreationOptional<Date | null>;
  declare aprobado_por: CreationOptional<number | null>;     // ref lógica a identity
}

Reserva.init(
  {
    id_reserva: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_espacio: { type: DataTypes.INTEGER, allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    hora_inicio: { type: DataTypes.TIME, allowNull: false },
    hora_fin: { type: DataTypes.TIME, allowNull: false },
    estado: { type: DataTypes.ENUM('PENDIENTE', 'APROBADA', 'CANCELADA'), defaultValue: 'PENDIENTE' },
    id_usuario: { type: DataTypes.INTEGER, allowNull: true },
    fecha_aprobacion: { type: DataTypes.DATE, allowNull: true },
    aprobado_por: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: 'reserva', timestamps: false },
);
