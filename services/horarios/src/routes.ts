const express = require('express');
const { Horario } = require('./models');

module.exports = (app) => {
  const r = express.Router();
  r.get('/', async (req, res) => {
    const rows = await Horario.findAll();
    res.json({ service: 'horarios', count: rows.length, items: rows });
  });
  r.post('/import', (req, res) =>
    res.status(501).json({ message: 'Pendiente fase 3: parser XLSX -> referencias por id_asignatura/id_espacio' }));
  app.use('/api/horario', r);
};