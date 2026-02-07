const express = require('express');
const router = express.Router();
const controllerEstudiante = require('../../controllers/estudiante/estudiante.controller');
const auth = require('../../middlewares/auth.middleware');

// 🔒 Todas estas rutas requieren token
router.get('/all', auth, controllerEstudiante.getAll);
router.get('/', auth, controllerEstudiante.getById);
router.post('/', auth, controllerEstudiante.create);
router.put('/:id', auth, controllerEstudiante.update);

// lógica académica
router.get('/:id/semestres', controllerEstudiante.getSemestres);
router.post('/:id/semestres', auth, controllerEstudiante.asignarSemestre);


module.exports = router;
