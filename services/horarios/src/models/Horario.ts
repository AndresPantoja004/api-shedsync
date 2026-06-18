import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class Horario extends Model<InferAttributes<Horario>, InferCreationAttributes<Horario>> {
  declare id_horario: CreationOptional<number>;
  declare dia: string | null;
  declare hora_inicio: string | null;
  declare hora_fin: string | null;
  // Referencias LÓGICAS a otros contextos (no FKs físicas):
  declare id_asignatura: number | null; // -> academico
  declare id_espacio: number | null;    // -> espacios
}

Horario.init(
  {
    id_horario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dia: DataTypes.STRING,
    hora_inicio: DataTypes.TIME,
    hora_fin: DataTypes.TIME,
    id_asignatura: { type: DataTypes.INTEGER, allowNull: true },
    id_espacio: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: 'horario', timestamps: false },
);
