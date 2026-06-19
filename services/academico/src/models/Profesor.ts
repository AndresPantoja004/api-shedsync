import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class Profesor extends Model<InferAttributes<Profesor>, InferCreationAttributes<Profesor>> {
  declare id_profesor: CreationOptional<number>;
  declare nombres: string;
  declare apellidos: string;
  declare email: string;
  // Referencia LÓGICA al servicio identity (no es FK física).
  declare id_usuario: number | null;
}

Profesor.init(
  {
    id_profesor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombres: DataTypes.STRING,
    apellidos: DataTypes.STRING,
    email: DataTypes.STRING,
    // Referencia LÓGICA al servicio identity (no es FK física).
    id_usuario: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: 'profesor', timestamps: false },
);
