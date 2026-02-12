const express = require('express');
const router = express.Router();
const { auth } = require('../../middlewares/auth.middleware');
const incidenciaController = require('../../controllers/incidencia/incidencia.controller');

router.post('/', auth, incidenciaController.create);
router.get('/count', incidenciaController.getCountByTipo);
router.get('/:id', incidenciaController.getById);

module.exports = router;