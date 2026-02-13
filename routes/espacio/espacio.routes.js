const express = require('express');
const router = express.Router();
const espacioController = require('../../controllers/espacio/espacio.controller');
const { auth, onlyAdmin } = require('../../middlewares/auth.middleware');

router.get('/', espacioController.getAll);
router.get('/disponibles', espacioController.getDisponibles);
router.get('/:id', espacioController.getById);
router.post('/', espacioController.create);
router.put('/:id', espacioController.update);
router.delete('/:id', espacioController.remove);
router.get('/:id/equipos', espacioController.getEquipos);

// user
router.post('/reservar', auth, espacioController.reservar);

// Admin
router.patch('/reservar/:id/estado', auth, onlyAdmin, espacioController.updateEstadoReserva);
router.get('/reservar/pendientes', auth, onlyAdmin, espacioController.getPendientes);


module.exports = router;
