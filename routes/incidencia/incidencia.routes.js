const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth.middleware');
const incidenciaController = require('../../controllers/incidencia/incidencia.controller');

router.post('/', auth, incidenciaController.create);
router.get('/aula/count', incidenciaController.getAulaCount);
router.get('/laboratorio/count', incidenciaController.getLabCount);
router.get('/criticas', incidenciaController.getCriticas);

module.exports = router;
