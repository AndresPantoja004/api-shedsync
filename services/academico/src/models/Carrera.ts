import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class Carrera extends Model<InferAttributes<Carrera>, InferCreationAttributes<Carrera>> {
  declare id_carrera: CreationOptional<number>;
  declare nombre: string;
  declare duracion_anios: number;
  declare total_semestres: number;
  declare estado: CreationOptional<boolean>;
}

Carrera.init(
  {
    id_carrera: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    duracion_anios: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_semestres: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  { sequelize, tableName: 'carrera', timestamps: false },
);
