import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class Rol extends Model<InferAttributes<Rol>, InferCreationAttributes<Rol>> {
  declare id_rol: CreationOptional<number>;
  declare nombre: string;
}

Rol.init(
  {
    id_rol: {
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
  {
    sequelize,
    tableName: 'rol',
    timestamps: false,
  },
);
