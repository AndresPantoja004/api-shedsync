const express = require('express');
const router = express.Router();
const horarioController = require('../../controllers/horario/horario.controller');

router.get('/estudiante/:id', horarioController.getByEstudiante);
router.get('/estudiante/:id/semanal', horarioController.getSemanal);
router.get('/:id/estudiante', horarioController.obtenerHorarioEstudiante);

module.exports = router;
