import { Router, type Express } from 'express';
import { Carrera, Estudiante } from './models';

export default function mountRoutes(app: Express): void {
  const carreraR = Router();
  carreraR.get('/', async (_req, res) => {
    const rows = await Carrera.findAll();
    res.json({ service: 'academico', recurso: 'carrera', count: rows.length, items: rows });
  });
  app.use('/api/carrera', carreraR);

  const estR = Router();
  estR.get('/', async (_req, res) => {
    const rows = await Estudiante.findAll();
    res.json({ service: 'academico', recurso: 'estudiante', count: rows.length, items: rows });
  });
  // Endpoint pensado para que el gateway/identity COMPONGA el login:
  estR.get('/by-usuario/:id_usuario', async (req, res) => {
    const est = await Estudiante.findOne({ where: { id_usuario: req.params.id_usuario } });
    if (!est) {
      res.status(404).json({ message: 'Sin estudiante para ese usuario' });
      return;
    }
    res.json(est);
  });
  app.use('/api/estudiante', estR);
}
