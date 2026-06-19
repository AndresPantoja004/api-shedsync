import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class Asignatura extends Model<InferAttributes<Asignatura>, InferCreationAttributes<Asignatura>> {
  declare id_asignatura: CreationOptional<number>;
  declare nombre: string;
  declare nrc: string;
}

Asignatura.init(
  {
    id_asignatura: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: DataTypes.STRING,
    nrc: DataTypes.STRING,
  },
  { sequelize, tableName: 'asignatura', timestamps: false },
);
