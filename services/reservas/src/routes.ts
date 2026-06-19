import { Router, type Express } from 'express';
import * as events from './events';
import * as ctrl from './controllers/reserva.controller';
import * as reservarCtrl from './controllers/reservar.controller';
import { auth, onlyAdmin } from './middlewares/auth';

events.connect(); // intenta conectar a RabbitMQ (no bloquea si no está)

export default function mountRoutes(app: Express): void {
  const r = Router();
  // ARRAY CRUDO con filtros ?fecha=&estado= (consumido por espacios).
  r.get('/', ctrl.obtenerReservasPorFecha);
  // Flujo: validar espacio vía espacios -> INSERT en BD propia -> publish a RabbitMQ.
  r.post('/', ctrl.crearReserva);
  // El monolito usa PUT; mantenemos PATCH como alias.
  r.put('/:id/cancelar', ctrl.cancelarReserva);
  r.patch('/:id/cancelar', ctrl.cancelarReserva);
  app.use('/api/reservas', r);

  // Router montado en /api/espacio/reservar (enrutado por el gateway).
  const er = Router();
  er.post('/', auth, reservarCtrl.reservar);
  // '/pendientes' debe ir antes que cualquier '/:id...'
  er.get('/pendientes', auth, onlyAdmin, reservarCtrl.getPendientes);
  er.patch('/:id/estado', auth, onlyAdmin, reservarCtrl.updateEstadoReserva);
  app.use('/api/espacio/reservar', er);
}
