import swaggerAutogen from 'swagger-autogen';

const outputFile = './swagger.json';
const endPointsFiles = ['./index.js'];

const doc = {
    info: {
        title: 'API de SchedSync',
        description: 'Esta API permite gestionar los horarios de todas las carreras de la ESPE Sede Santo Domingo',
    },
    host: 'p01--api-schedsync--k7nq7x6nhfgl.code.run',
    schemes: ['https']
}


swaggerAutogen()(outputFile, endPointsFiles, doc);