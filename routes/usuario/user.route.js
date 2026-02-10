const express = require('express');
const router = express.Router();
const controller = require('../../controllers/usuario/usuario.controller');
const auth = require('../../middlewares/auth.middleware');

// Obtener datos del usuario autenticado
router.get('/', auth, controller.getById);

// Asignar un rol al usuario 
router.post('/:id/asignar-rol', controller.asignarRol);

module.exports = router;