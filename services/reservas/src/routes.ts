import { Router, type Express } from 'express';
import { Reserva } from './models';
import * as events from './events';
import * as ctrl from './controllers/reserva.controller';

events.connect(); // intenta conectar a RabbitMQ (no bloquea si no está)

export default function mountRoutes(app: Express): void {
  const r = Router();
  r.get('/', async (_req, res) => {
    const rows = await Reserva.findAll({ order: [['fecha', 'DESC']] });
    res.json({ service: 'reservas', count: rows.length, items: rows });
  });
  // Flujo: validar espacio vía espacios -> INSERT en BD propia -> publish a RabbitMQ.
  r.post('/', ctrl.crearReserva);
  r.patch('/:id/cancelar', ctrl.cancelarReserva);
  app.use('/api/reservas', r);
}
