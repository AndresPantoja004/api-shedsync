const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const { sequelize  } = require('./database/db_conection');

const auth = require('./routes/auth/auth.routes');


app.use(express.json());
app.use(cors());

app.use('/api/auth', auth);


const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida con éxito.');
        app.listen(port, () => {
            console.log(`Servidor escuchando en http://localhost:${port}`);
        });
    } catch (error) {
        console.log('No se pudo conectar a la base de datos:', error);
    }
};

start();