const express = require('express');
const { Incidencia } = require('./models');
const { auth, onlyAdmin } = require('./middlewares/auth');
const events = require('./events');

events.connect();

module.exports = (app) => {
  const r = express.Router();
  // GET sin la columna imagen (base64 pesado)
  r.get('/', auth, onlyAdmin, async (req, res) => {
    const rows = await Incidencia.findAll({ attributes: { exclude: ['imagen'] }, order: [['fecha', 'DESC']] });
    res.json({ service: 'incidencias', count: rows.length, items: rows });
  });
  // Primer candidato a migración real (fase 2): el id_usuario sale del JWT.
  r.post('/', auth, (req, res) =>
    res.status(501).json({ message: 'Pendiente fase 2: incidencia.create (id_usuario del JWT, id_espacio como ref lógica)' }));
  app.use('/api/incidencia', r);
};