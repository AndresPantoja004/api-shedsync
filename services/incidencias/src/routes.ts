import { Router, type Express } from 'express';
import { auth, onlyAdmin } from './middlewares/auth';
import * as ctrl from './controllers/incidencia.controller';
import * as events from './events';

events.connect(); // intenta conectar a RabbitMQ (no bloquea si no está)

export default function mountRoutes(app: Express): void {
  const r = Router();

  // OJO con el orden: /count antes de /:id para que no lo capture el param.
  r.post('/', auth, ctrl.create);
  r.get('/count', ctrl.getCountByTipo);
  r.get('/', auth, onlyAdmin, ctrl.getAll);
  r.get('/:id', ctrl.getById);
  r.patch('/:id/estado', auth, onlyAdmin, ctrl.updateEstado);

  app.use('/api/incidencia', r);
}