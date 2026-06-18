import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class Incidencia extends Model
  InferAttributes<Incidencia>,
  InferCreationAttributes<Incidencia>
> {
  declare id_incidencia: CreationOptional<number>;
  declare tipo: string | null;
  declare descripcion: string | null;
  declare imagen: string | null;       // base64
  declare estado: CreationOptional<string>;
  declare fecha: CreationOptional<Date>;
  // Referencias LÓGICAS a otros contextos (no FKs físicas):
  declare id_usuario: number | null;   // -> identity
  declare id_espacio: number | null;   // -> espacios
  declare id_equipo: number | null;    // -> espacios (equipo)
}

Incidencia.init(
  {
    id_incidencia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    imagen: { type: DataTypes.TEXT('long'), allowNull: true },
    estado: { type: DataTypes.STRING, defaultValue: 'Reportado' },
    fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    id_usuario: { type: DataTypes.INTEGER, allowNull: true },
    id_espacio: { type: DataTypes.INTEGER, allowNull: true },
    id_equipo: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: 'incidencia', timestamps: false },
);