const { sequelize } = require('../database/db_conection');

const Usuario = require('./Usuario');
const Rol = require('./Rol');
const UsuarioRol = require('./UsuarioRol');

const TipoCarrera = require('./TipoCarrera');
const Carrera = require('./Carrera');
const Semestre = require('./Semestre');
const Asignatura = require('./Asignatura');

const Profesor = require('./Profesor');
const Estudiante = require('./Estudiante');
const EstudianteSemestre = require('./EstudianteSemestre');

const Aula = require('./Aula');
const Laboratorio = require('./Laboratorio');
const Equipo = require('./Equipo');

const Horario = require('./Horario');
const Incidencia = require('./Incidencia');


//Tipo estudiante
const TipoEstudiante = require('./TipoEstudiante')

// Usuario - Rol (N:M)
Usuario.belongsToMany(Rol, {
  through: UsuarioRol,
  foreignKey: 'id_usuario',
});
Rol.belongsToMany(Usuario, {
  through: UsuarioRol,
  foreignKey: 'id_rol',
});

// Usuario - Profesor / Estudiante
Profesor.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasOne(Profesor, { foreignKey: 'id_usuario' });

Estudiante.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasOne(Estudiante, { foreignKey: 'id_usuario' });

// TipoCarrera - Carrera
Carrera.belongsTo(TipoCarrera, { foreignKey: 'id_tipo_carrera' });
TipoCarrera.hasMany(Carrera, { foreignKey: 'id_tipo_carrera' });

// Carrera - Semestre
Semestre.belongsTo(Carrera, { foreignKey: 'id_carrera' });
Carrera.hasMany(Semestre, { foreignKey: 'id_carrera' });

// Semestre - Asignatura
Asignatura.belongsTo(Semestre, { foreignKey: 'id_semestre' });
Semestre.hasMany(Asignatura, { foreignKey: 'id_semestre', as: 'asignaturas' });

// Profesor - Asignatura
Asignatura.belongsTo(Profesor, { foreignKey: 'id_profesor' });
Profesor.hasMany(Asignatura, { foreignKey: 'id_profesor' });

// Estudiante - Carrera
Estudiante.belongsTo(Carrera, { foreignKey: 'id_carrera' });
Carrera.hasMany(Estudiante, { foreignKey: 'id_carrera' });

//EstudianteSemestre - TipoEstudiante
EstudianteSemestre.belongsTo(TipoEstudiante,{foreignKey:'id_tipoestu'});
TipoEstudiante.hasMany(EstudianteSemestre,{foreignKey:'id_tipoestu'});


//Relacion estudiante semestre con asignatura
EstudianteSemestre.belongsTo(Asignatura, {
  foreignKey: 'id_asignatura'
});

Asignatura.hasMany(EstudianteSemestre, {
  foreignKey: 'id_asignatura'
});


// Estudiante - Semestre (N:M)
Estudiante.belongsToMany(Semestre, {
  through: EstudianteSemestre,
  foreignKey: 'id_estudiante',
});
Semestre.belongsToMany(Estudiante, {
  through: EstudianteSemestre,
  foreignKey: 'id_semestre',
});

// Laboratorio - Equipo
Equipo.belongsTo(Laboratorio, { foreignKey: 'id_laboratorio' });
Laboratorio.hasMany(Equipo, { foreignKey: 'id_laboratorio' });

// Horario
Horario.belongsTo(Asignatura, { foreignKey: 'id_asignatura' });
Asignatura.hasMany(Horario, { foreignKey: 'id_asignatura' });

Horario.belongsTo(Aula, { foreignKey: 'id_aula' });
Aula.hasMany(Horario, { foreignKey: 'id_aula' });

Horario.belongsTo(Laboratorio, { foreignKey: 'id_laboratorio' });
Laboratorio.hasMany(Horario, { foreignKey: 'id_laboratorio' });

// Incidencia
Incidencia.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(Incidencia, { foreignKey: 'id_usuario' });

Incidencia.belongsTo(Aula, { foreignKey: 'id_aula' });
Aula.hasMany(Incidencia, { foreignKey: 'id_aula' });

Incidencia.belongsTo(Laboratorio, { foreignKey: 'id_laboratorio' });
Laboratorio.hasMany(Incidencia, { foreignKey: 'id_laboratorio' });

Incidencia.belongsTo(Equipo, { foreignKey: 'id_equipo' });
Equipo.hasMany(Incidencia, { foreignKey: 'id_equipo' });

module.exports = {
  sequelize,
  Usuario,
  Rol,
  UsuarioRol,
  TipoCarrera,
  Carrera,
  Semestre,
  Asignatura,
  Profesor,
  Estudiante,
  EstudianteSemestre,
  Aula,
  Laboratorio,
  Equipo,
  Horario,
  Incidencia,
  TipoEstudiante
};
