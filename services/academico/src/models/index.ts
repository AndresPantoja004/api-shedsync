const TipoCarrera = require('./TipoCarrera');
const Carrera = require('./Carrera');
const Semestre = require('./Semestre');
const Asignatura = require('./Asignatura');
const Profesor = require('./Profesor');
const Estudiante = require('./Estudiante');
const EstudianteSemestre = require('./EstudianteSemestre');
const TipoEstudiante = require('./TipoEstudiante');

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

module.exports = {
  TipoCarrera, Carrera, Semestre, Asignatura,
  Profesor, Estudiante, EstudianteSemestre, TipoEstudiante,
};