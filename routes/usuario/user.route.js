const express = require('express');
const router = express.Router();
const controller = require('../../controllers/usuario/usuario.controller');
const auth = require('../../middlewares/auth.middleware');

// Todas estas rutas requieren token
router.get('/', auth, controller.getById);

module.exports = router;