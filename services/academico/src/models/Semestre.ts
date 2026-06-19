import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class Semestre extends Model<InferAttributes<Semestre>, InferCreationAttributes<Semestre>> {
  declare id_semestre: CreationOptional<number>;
  declare nivel: number;
  declare numero_asignaturas: CreationOptional<number>;
}

Semestre.init(
  {
    id_semestre: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    numero_asignaturas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  { sequelize, tableName: 'semestre', timestamps: false },
);
