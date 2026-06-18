import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class Espacio extends Model<InferAttributes<Espacio>, InferCreationAttributes<Espacio>> {
  declare id_espacio: CreationOptional<number>;
  declare nombre: string | null;
  declare tipo: 'AULA' | 'LABORATORIO' | 'VIRTUAL' | 'OTRO';
  declare capacidad: number | null;
}

Espacio.init(
  {
    id_espacio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: DataTypes.STRING,
    tipo: {
      type: DataTypes.ENUM('AULA', 'LABORATORIO', 'VIRTUAL', 'OTRO'),
      allowNull: false,
    },
    capacidad: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: 'espacio',
    timestamps: false,
  },
);
