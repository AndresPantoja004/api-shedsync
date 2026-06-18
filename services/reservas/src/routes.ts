import { Router, type Express } from 'express';
import { Reserva } from './models';
import * as events from './events';

events.connect(); // intenta conectar a RabbitMQ (no bloquea si no está)

export default function mountRoutes(app: Express): void {
  const r = Router();
  r.get('/', async (_req, res) => {
    const rows = await Reserva.findAll({ order: [['fecha', 'DESC']] });
    res.json({ service: 'reservas', count: rows.length, items: rows });
  });
  // Stub que ilustra el flujo objetivo: validar espacio vía espacios + publicar evento.
  r.post('/', (_req, res) =>
    res.status(501).json({
      message: 'Pendiente fase 3: crear reserva',
      flujo_objetivo: [
        'GET espacios /api/espacio/:id/exists (validación síncrona)',
        'INSERT reserva en BD propia',
        'publish("reserva.creada", {...}) a RabbitMQ',
      ],
    }));
  app.use('/api/reservas', r);
}
