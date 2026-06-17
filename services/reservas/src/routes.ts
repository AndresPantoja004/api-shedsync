const express = require('express');
const { Reserva } = require('./models');
const events = require('./events');

events.connect(); // intenta conectar a RabbitMQ (no bloquea si no está)

module.exports = (app) => {
  const r = express.Router();
  r.get('/', async (req, res) => {
    const rows = await Reserva.findAll({ order: [['fecha', 'DESC']] });
    res.json({ service: 'reservas', count: rows.length, items: rows });
  });
  // Stub que ilustra el flujo objetivo: validar espacio vía espacios + publicar evento.
  r.post('/', (req, res) =>
    res.status(501).json({
      message: 'Pendiente fase 3: crear reserva',
      flujo_objetivo: [
        'GET espacios /api/espacio/:id/exists (validación síncrona)',
        'INSERT reserva en BD propia',
        'publish("reserva.creada", {...}) a RabbitMQ',
      ],
    }));
  app.use('/api/reservas', r);
};