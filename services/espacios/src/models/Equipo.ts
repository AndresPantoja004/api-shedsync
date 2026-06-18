import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class Equipo extends Model<InferAttributes<Equipo>, InferCreationAttributes<Equipo>> {
  declare id_equipo: CreationOptional<number>;
  declare codigo: string | null;
  declare estado: string | null;
  // id_espacio lo crea la asociación interna Espacio.hasMany(Equipo)
}

Equipo.init(
  {
    id_equipo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo: DataTypes.STRING,
    estado: DataTypes.STRING,
    // id_espacio lo crea la asociación interna Espacio.hasMany(Equipo)
  },
  {
    sequelize,
    tableName: 'equipo',
    timestamps: false,
  },
);
