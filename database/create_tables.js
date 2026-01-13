const { sequelize } = require('./db_conection');

require('../models/TipoCarrera');
require('../models/Carrera');
require('../models/Semestre');
require('../models/Usuario');
require('../models/Rol');
require('../models/UsuarioRol');
require('../models/Profesor');
require('../models/Estudiante');
require('../models/EstudianteSemestre');
require('../models/Asignatura');
require('../models/Aula');
require('../models/Laboratorio');
require('../models/Equipo');
require('../models/Horario');
require('../models/Incidencia');

const iniciar = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas creadas / actualizadas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

iniciar();
