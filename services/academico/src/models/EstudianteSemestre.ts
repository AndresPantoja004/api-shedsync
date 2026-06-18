import {
  DataTypes, Model,
  type InferAttributes, type InferCreationAttributes, type CreationOptional,
} from 'sequelize';
import { sequelize } from '../db';

export class EstudianteSemestre extends Model<
  InferAttributes<EstudianteSemestre>,
  InferCreationAttributes<EstudianteSemestre>
> {
  declare id_estudiante_semestre: CreationOptional<number>;
  declare id_estudiante: number;
  declare id_semestre: number;
  declare id_asignatura: number;
  declare id_tipoestu: number;
}

EstudianteSemestre.init(
  {
    id_estudiante_semestre: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_estudiante: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_semestre: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_asignatura: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_tipoestu: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { sequelize, tableName: 'estudiante_semestre', timestamps: false },
);
