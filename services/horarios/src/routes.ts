import { Router, type Express } from 'express';
import { Horario } from './models';

export default function mountRoutes(app: Express): void {
  const r = Router();
  r.get('/', async (_req, res) => {
    const rows = await Horario.findAll();
    res.json({ service: 'horarios', count: rows.length, items: rows });
  });
  r.post('/import', (_req, res) =>
    res.status(501).json({ message: 'Pendiente fase 3: parser XLSX -> referencias por id_asignatura/id_espacio' }));
  app.use('/api/horario', r);
}
