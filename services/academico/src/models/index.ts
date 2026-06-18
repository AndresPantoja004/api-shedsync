import { TipoCarrera } from './TipoCarrera';
import { Carrera } from './Carrera';
import { Semestre } from './Semestre';
import { Asignatura } from './Asignatura';
import { Profesor } from './Profesor';
import { Estudiante } from './Estudiante';
import { EstudianteSemestre } from './EstudianteSemestre';
import { TipoEstudiante } from './TipoEstudiante';

// Todas estas relaciones son INTERNAS al contexto académico.
Carrera.belongsTo(TipoCarrera, { foreignKey: 'id_tipo_carrera' });
TipoCarrera.hasMany(Carrera, { foreignKey: 'id_tipo_carrera' });

Semestre.belongsTo(Carrera, { foreignKey: 'id_carrera' });
Carrera.hasMany(Semestre, { foreignKey: 'id_carrera' });

Asignatura.belongsTo(Semestre, { foreignKey: 'id_semestre' });
Semestre.hasMany(Asignatura, { foreignKey: 'id_semestre', as: 'asignaturas' });

Asignatura.belongsTo(Profesor, { foreignKey: 'id_profesor' });
Profesor.hasMany(Asignatura, { foreignKey: 'id_profesor' });

Estudiante.belongsTo(Carrera, { foreignKey: 'id_carrera' });
Carrera.hasMany(Estudiante, { foreignKey: 'id_carrera' });

EstudianteSemestre.belongsTo(TipoEstudiante, { foreignKey: 'id_tipoestu' });
TipoEstudiante.hasMany(EstudianteSemestre, { foreignKey: 'id_tipoestu' });

EstudianteSemestre.belongsTo(Asignatura, { foreignKey: 'id_asignatura' });
Asignatura.hasMany(EstudianteSemestre, { foreignKey: 'id_asignatura' });

Estudiante.belongsToMany(Semestre, { through: EstudianteSemestre, foreignKey: 'id_estudiante' });
Semestre.belongsToMany(Estudiante, { through: EstudianteSemestre, foreignKey: 'id_semestre' });

export {
  TipoCarrera, Carrera, Semestre, Asignatura,
  Profesor, Estudiante, EstudianteSemestre, TipoEstudiante,
};
