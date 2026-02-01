const express = require('express');
const router = express.Router();
const aulaController = require('../../controllers/aula/aula.controller');

router.get('/', aulaController.getAll);
router.get('/disponibles', aulaController.getDisponibles);

module.exports = router;