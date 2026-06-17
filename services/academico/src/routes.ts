const express = require('express');
const { Carrera, Estudiante } = require('./models');

module.exports = (app) => {
  const carreraR = express.Router();
  carreraR.get('/', async (req, res) => {
    const rows = await Carrera.findAll();
    res.json({ service: 'academico', recurso: 'carrera', count: rows.length, items: rows });
  });
  app.use('/api/carrera', carreraR);

  const estR = express.Router();
  estR.get('/', async (req, res) => {
    const rows = await Estudiante.findAll();
    res.json({ service: 'academico', recurso: 'estudiante', count: rows.length, items: rows });
  });
  // Endpoint pensado para que el gateway/identity COMPONGA el login:
  estR.get('/by-usuario/:id_usuario', async (req, res) => {
    const est = await Estudiante.findOne({ where: { id_usuario: req.params.id_usuario } });
    if (!est) return res.status(404).json({ message: 'Sin estudiante para ese usuario' });
    res.json(est);
  });
  app.use('/api/estudiante', estR);
};