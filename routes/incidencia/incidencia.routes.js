const express = require('express');
const router = express.Router();
const { auth, onlyAdmin } = require('../../middlewares/auth.middleware');
const incidenciaController = require('../../controllers/incidencia/incidencia.controller');

router.post('/',auth, incidenciaController.create);
router.get('/count', incidenciaController.getCountByTipo);
router.get('/:id', incidenciaController.getById);

// User
router.post('/', auth, incidenciaController.create);
//Admin
router.get('/', auth, onlyAdmin, incidenciaController.getAll);
router.patch('/:id/estado', auth, onlyAdmin, incidenciaController.updateEstado);

module.exports = router;
