import { Router, type Express } from 'express';
import { Op, type WhereOptions } from 'sequelize';
import { Espacio, Equipo } from './models';
import { getHorariosByDia } from './clients/horarios.client';
import { getReservasAprobadas } from './clients/reservas.client';

export default function mountRoutes(app: Express): void {
  const r = Router();

  // getAll -> ARRAY CRUDO (lo consumen los clientes de incidencias y horarios).
  r.get('/', async (req, res) => {
    const { tipo, search } = req.query;
    const where: WhereOptions<Espacio> = {};
    if (tipo) (where as any).tipo = tipo;
    if (search) (where as any).nombre = { [Op.like]: `%${search}%` };

    const rows = await Espacio.findAll({
      where,
      order: [['nombre', 'ASC']],
      attributes: ['id_espacio', 'nombre', 'tipo', 'capacidad'],
    });
    res.json(rows);
    return;
  });

  // getDisponibles -> COMPOSICIÓN cross-context (horarios + reservas vía HTTP).
  // DEBE ir antes que '/:id'.
  r.get('/disponibles', async (req, res) => {
    const { tipo, search } = req.query;

    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const now = new Date();
    const diaActual = dias[now.getDay()]!;
    const horaActual = now.toTimeString().slice(0, 8);
    const fechaActual = now.toISOString().slice(0, 10);

    const where: WhereOptions<Espacio> = {};
    if (tipo) (where as any).tipo = tipo;
    if (search) (where as any).nombre = { [Op.like]: `%${search}%` };

    const espacios = await Espacio.findAll({
      where,
      order: [['nombre', 'ASC']],
    });

    // Composición HTTP con degradación elegante (listas vacías si fallan).
    const [horarios, reservas] = await Promise.all([
      getHorariosByDia(diaActual),
      getReservasAprobadas(fechaActual),
    ]);

    // Agrupar por id_espacio.
    const horariosPorEspacio = new Map<number, typeof horarios>();
    for (const h of horarios) {
      const arr = horariosPorEspacio.get(h.id_espacio) ?? [];
      arr.push(h);
      horariosPorEspacio.set(h.id_espacio, arr);
    }
    const reservasPorEspacio = new Map<number, typeof reservas>();
    for (const rs of reservas) {
      const arr = reservasPorEspacio.get(rs.id_espacio) ?? [];
      arr.push(rs);
      reservasPorEspacio.set(rs.id_espacio, arr);
    }

    const resultado = espacios.map((espacio) => {
      const hs = horariosPorEspacio.get(espacio.id_espacio) ?? [];
      const rsv = reservasPorEspacio.get(espacio.id_espacio) ?? [];

      const horariosProcesados = hs.map((h) => {
        const tieneReserva = rsv.some(
          (rr) => rr.hora_inicio === h.hora_inicio && rr.hora_fin === h.hora_fin,
        );

        let estado = 'DISPONIBLE';
        if (h.hora_fin <= horaActual) {
          estado = 'PASADO';
        } else if (tieneReserva) {
          estado = 'OCUPADO';
        }

        return {
          id_horario: h.id_horario,
          dia: h.dia,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          estado,
        };
      });

      return {
        id_espacio: espacio.id_espacio,
        nombre: espacio.nombre,
        capacidad: espacio.capacidad,
        tipo: espacio.tipo,
        horarios: horariosProcesados,
      };
    });

    res.json(resultado);
    return;
  });

  // findOrCreate idempotente (lo consume horarios al importar el XLSX).
  r.post('/', async (req, res) => {
    const { nombre, tipo, capacidad } = req.body ?? {};
    const [espacio] = await Espacio.findOrCreate({
      where: { nombre },
      defaults: { nombre, tipo, capacidad },
    });
    res.json(espacio);
    return;
  });

  // Validación que consumirán reservas/incidencias en vez de un JOIN distribuido:
  r.get('/:id/exists', async (req, res) => {
    const e = await Espacio.findByPk(req.params.id);
    res.json({ id_espacio: Number(req.params.id), exists: !!e, espacio: e ?? null });
    return;
  });

  r.get('/:id/equipos', async (req, res) => {
    const espacio = await Espacio.findByPk(req.params.id);
    if (!espacio) {
      res.status(404).json({ msg: 'Espacio no encontrado' });
      return;
    }
    if (espacio.tipo !== 'LABORATORIO') {
      res.status(400).json({ msg: 'Este espacio no es un laboratorio' });
      return;
    }
    // id_espacio es la FK que inyecta la asociación, no está en InferAttributes<Equipo>
    const rows = await Equipo.findAll({
      where: { id_espacio: req.params.id } as WhereOptions<Equipo>,
    });
    res.json(rows);
    return;
  });

  r.get('/:id', async (req, res) => {
    const espacio = await Espacio.findByPk(req.params.id);
    if (!espacio) {
      res.status(404).json({ msg: 'Espacio no encontrado' });
      return;
    }
    res.json(espacio);
    return;
  });

  r.put('/:id', async (req, res) => {
    try {
      await Espacio.update(req.body, {
        where: { id_espacio: req.params.id } as WhereOptions<Espacio>,
      });
      res.json({ msg: 'Espacio actualizado' });
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
    return;
  });

  r.delete('/:id', async (req, res) => {
    try {
      await Espacio.destroy({
        where: { id_espacio: req.params.id } as WhereOptions<Espacio>,
      });
      res.json({ msg: 'Espacio eliminado' });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
    return;
  });

  app.use('/api/espacio', r);
}
