import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class Usuario extends Model<InferAttributes<Usuario>, InferCreationAttributes<Usuario>> {
  declare id_usuario: CreationOptional<number>;
  declare email: string;
  declare phone: CreationOptional<string | null>;
  declare password_hash: string;
  declare activo: CreationOptional<boolean>;
  declare avatar: CreationOptional<string | null>;
  declare fecha_creacion: CreationOptional<Date>;
}

Usuario.init(
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      defaultValue: null,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    avatar: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      defaultValue: null,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'usuario',
    timestamps: false,
  },
);
