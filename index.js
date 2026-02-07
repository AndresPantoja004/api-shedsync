require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const { sequelize  } = require('./database/db_conection');
const swaggerUI = require('swagger-ui-express');
const swaggerDocumentation = require('./swagger.json');


const auth = require('./routes/auth/auth.routes');
const aula = require('./routes/aula/aula.routes');
const incidencia = require('./routes/incidencia/incidencia.routes');
const horario = require('./routes/horario/horario.routes');
const carrera = require('./routes/carrera/carrera.routes');
const estudiante = require('./routes/estudiante/estudiante.routes');
const laboratorio = require('./routes/laboratorio/laboratorio.routes');

app.use(express.json());
app.use(cors());

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocumentation));
app.use('/api/auth', auth);
app.use('/api/aula', aula);
app.use('/api/incidencia', incidencia);
app.use('/api/horario', horario);
app.use('/api/carrera', carrera);
app.use('/api/estudiante', estudiante);
app.use('/api/laboratorio', laboratorio);

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida con éxito.');
        app.listen(port, () => {
            console.log(`Servidor escuchando en http://localhost:${port}`);
            console.log(`Documentacion en http://localhost:${port}/docs`);
        });
    } catch (error) {
        console.log('No se pudo conectar a la base de datos:', error);
    }
};

start();