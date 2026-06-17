const express = require('express');
const { Espacio, Equipo } = require('./models');

module.exports = (app) => {
  const r = express.Router();
  r.get('/', async (req, res) => {
    const rows = await Espacio.findAll();
    res.json({ service: 'espacios', count: rows.length, items: rows });
  });
  // Validación que consumirán reservas/incidencias en vez de un JOIN distribuido:
  r.get('/:id/exists', async (req, res) => {
    const e = await Espacio.findByPk(req.params.id);
    res.json({ id_espacio: Number(req.params.id), exists: !!e, espacio: e || null });
  });
  r.get('/:id/equipos', async (req, res) => {
    const rows = await Equipo.findAll({ where: { id_espacio: req.params.id } });
    res.json({ count: rows.length, items: rows });
  });
  app.use('/api/espacio', r);
};