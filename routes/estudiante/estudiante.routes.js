const express = require('express');
const router = express.Router();
const controller = require('../../controllers/estudiante/estudiante.controller');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);

// lógica académica
router.get('/:id/semestres', controller.getSemestres);
router.post('/:id/semestres', controller.asignarSemestre);

module.exports = router;
