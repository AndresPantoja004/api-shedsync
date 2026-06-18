import { Router, type Express } from 'express';
import type { WhereOptions } from 'sequelize';
import { Espacio, Equipo } from './models';

export default function mountRoutes(app: Express): void {
  const r = Router();
  r.get('/', async (_req, res) => {
    const rows = await Espacio.findAll();
    res.json({ service: 'espacios', count: rows.length, items: rows });
  });
  // findOrCreate idempotente (lo consume horarios al importar el XLSX).
  r.post('/', async (req, res) => {
    const { nombre, tipo, capacidad } = req.body ?? {};
    const [espacio] = await Espacio.findOrCreate({
      where: { nombre },
      defaults: { nombre, tipo, capacidad },
    });
    res.json(espacio);
  });
  // Validación que consumirán reservas/incidencias en vez de un JOIN distribuido:
  r.get('/:id/exists', async (req, res) => {
    const e = await Espacio.findByPk(req.params.id);
    res.json({ id_espacio: Number(req.params.id), exists: !!e, espacio: e ?? null });
  });
  r.get('/:id/equipos', async (req, res) => {
    // id_espacio es la FK que inyecta la asociación, no está en InferAttributes<Equipo>
    const rows = await Equipo.findAll({
      where: { id_espacio: req.params.id } as WhereOptions<Equipo>,
    });
    res.json({ count: rows.length, items: rows });
  });
  app.use('/api/espacio', r);
}
