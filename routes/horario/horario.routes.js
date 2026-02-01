const express = require('express');
const router = express.Router();
const horarioController = require('../../controllers/horario/horario.controller');

router.get('/estudiante/:id', horarioController.getByEstudiante);
router.get('/estudiante/:id/semanal', horarioController.getSemanal);

module.exports = router;
