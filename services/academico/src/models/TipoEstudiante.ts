import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class TipoEstudiante extends Model<InferAttributes<TipoEstudiante>, InferCreationAttributes<TipoEstudiante>> {
  declare id_tipoestu: CreationOptional<number>;
  declare nombre: string;
}

TipoEstudiante.init(
  {
    id_tipoestu: {
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
  { sequelize, tableName: 'tipo_estudiante', timestamps: false },
);
