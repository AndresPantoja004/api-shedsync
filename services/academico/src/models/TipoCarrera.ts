import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class TipoCarrera extends Model<InferAttributes<TipoCarrera>, InferCreationAttributes<TipoCarrera>> {
  declare id_tipo_carrera: CreationOptional<number>;
  declare nombre: string;
}

TipoCarrera.init(
  {
    id_tipo_carrera: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  { sequelize, tableName: 'tipo_carrera', timestamps: false },
);
