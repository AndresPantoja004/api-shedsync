import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../db';

export class UsuarioRol extends Model<InferAttributes<UsuarioRol>, InferCreationAttributes<UsuarioRol>> {
  declare id_usuario: number;
  declare id_rol: number;
}

UsuarioRol.init(
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_rol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: 'usuario_rol',
    timestamps: false,
  },
);
