const express = require('express');
const { Usuario } = require('./models');
const { auth } = require('./middlewares/auth');

module.exports = (app) => {
  // --- /api/auth ---
  const authR = express.Router();
  authR.post('/login', (req, res) =>
    res.status(501).json({ message: 'Pendiente fase 2: auth.login (compone datos académicos vía academico)' }));
  authR.post('/register', (req, res) =>
    res.status(501).json({ message: 'Pendiente fase 2: auth.register' }));
  app.use('/api/auth', authR);

  // --- /api/usuario ---
  const userR = express.Router();
  userR.get('/', auth, async (req, res) => {
    const users = await Usuario.findAll({ attributes: ['id_usuario', 'email', 'phone', 'activo'] });
    res.json({ service: 'identity', count: users.length, items: users });
  });
  app.use('/api/usuario', userR);
};