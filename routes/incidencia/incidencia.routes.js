const express = require('express');
const router = express.Router();
const incidenciaController = require('../../controllers/incidencia/incidencia.controller');

router.post('/', incidenciaController.create);
router.get('/reporte', incidenciaController.getReporte);
router.get('/criticas', incidenciaController.getCriticas);

module.exports = router;
