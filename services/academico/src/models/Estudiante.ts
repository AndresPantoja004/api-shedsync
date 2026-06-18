import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class Estudiante extends Model<InferAttributes<Estudiante>, InferCreationAttributes<Estudiante>> {
  declare id_estudiante: CreationOptional<number>;
  declare nombres: string;
  declare apellidos: string;
  declare tipo: string;
  // Referencia LÓGICA al servicio identity (no es FK física).
  declare id_usuario: number | null;
}

Estudiante.init(
  {
    id_estudiante: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombres: DataTypes.STRING,
    apellidos: DataTypes.STRING,
    tipo: { type: DataTypes.CHAR(1), allowNull: false },
    // Referencia LÓGICA al servicio identity (no es FK física).
    id_usuario: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: 'estudiante', timestamps: false },
);
