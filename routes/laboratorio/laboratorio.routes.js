const express = require('express');
const router = express.Router();
const controller = require('../../controllers/laboratorio/laboratorio.controller');

router.get('/', controller.getAll);
router.get('/disponibles', controller.getDisponibles);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

// equipos
router.get('/:id/equipos', controller.getEquipos);

module.exports = router;
