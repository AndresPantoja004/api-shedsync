import type { Request, Response } from 'express';
import { Op, fn, col } from 'sequelize';
import { Incidencia } from '../models';
import * as espacios from '../clients/espacios.client';
import * as events from '../events';

// POST /api/incidencia  (auth) — el id_usuario sale del JWT.
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { tipo, descripcion, imagen, estado, id_espacio, id_equipo } = req.body;
    const id_usuario = req.user!.id_usuario;

    const idEspacioNum = Number.parseInt(id_espacio, 10);

    // Validación SÍNCRONA cross-context (reemplaza la FK física hacia espacio):
    if (!Number.isNaN(idEspacioNum)) {
      const existe = await espacios.espacioExists(idEspacioNum);
      if (!existe) {
        res.status(422).json({ error: `El espacio ${idEspacioNum} no existe` });
        return;
      }
    }

    const result = await Incidencia.create({
      tipo,
      descripcion,
      imagen,
      estado: estado || 'Reportado',
      id_usuario,
      id_espacio: Number.isNaN(idEspacioNum) ? null : idEspacioNum,
      id_equipo: id_equipo ? Number.parseInt(id_equipo, 10) : null,
    });

    // Evento de dominio (asíncrono, best-effort: no bloquea la respuesta):
    await events.publish('incidencia.creada', {
      id_incidencia: result.id_incidencia,
      id_espacio: result.id_espacio,
      id_usuario: result.id_usuario,
      tipo: result.tipo,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error al crear incidencia:', error);
    res.status(400).json({ error: (error as Error).message });
  }
}

// GET /api/incidencia/count — conteo por espacio (composición, sin JOIN distribuido).
export async function getCountByTipo(req: Request, res: Response): Promise<void> {
  try {
    const tipo = req.query.tipo as string | undefined;
    const espaciosMap = await espacios.getEspaciosMap();

    const rows = (await Incidencia.findAll({
      attributes: ['id_espacio', [fn('COUNT', col('id_incidencia')), 'total']],
      where: { id_espacio: { [Op.ne]: null } },
      group: ['id_espacio'],
      raw: true,
    })) as unknown as Array<{ id_espacio: number; total: string }>;

    const result = rows
      .map((r) => {
        const esp = espaciosMap.get(r.id_espacio) ?? null;
        return {
          id_espacio: r.id_espacio,
          total: Number(r.total),
          Espacio: esp ? { tipo: esp.tipo } : null,
        };
      })
      .filter((r) => (tipo ? r.Espacio?.tipo === tipo : true));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

// GET /api/incidencia/:id — incidencia + datos del espacio compuestos vía API.
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const incidencia = await Incidencia.findByPk(req.params.id);
    if (!incidencia) {
      res.status(404).json({ msg: 'Incidencia no encontrada' });
      return;
    }
    const Espacio = incidencia.id_espacio ? await espacios.getEspacio(incidencia.id_espacio) : null;
    res.json({ ...incidencia.toJSON(), Espacio });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

// GET /api/incidencia  (auth + admin) — filtros locales + composición de espacio.
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { estado, tipo, fechaDesde, fechaHasta } = req.query as Record<string, string | undefined>;

    const where: Record<string, unknown> = {};
    if (estado) where.estado = estado;
    if (fechaDesde && fechaHasta) {
      where.fecha = { [Op.between]: [new Date(`${fechaDesde} 00:00:00`), new Date(`${fechaHasta} 23:59:59`)] };
    } else if (fechaDesde) {
      where.fecha = { [Op.gte]: new Date(`${fechaDesde} 00:00:00`) };
    } else if (fechaHasta) {
      where.fecha = { [Op.lte]: new Date(`${fechaHasta} 23:59:59`) };
    }

    const incidencias = await Incidencia.findAll({ where, order: [['fecha', 'DESC']] });
    const espaciosMap = await espacios.getEspaciosMap();

    const data = incidencias
      .map((inc) => {
        const esp = inc.id_espacio ? espaciosMap.get(inc.id_espacio) ?? null : null;
        const Espacio = esp ? { id_espacio: esp.id_espacio, nombre: esp.nombre, tipo: esp.tipo } : null;
        return { ...inc.toJSON(), Espacio };
      })
      // Si filtran por tipo de espacio, solo dejamos las que coinciden:
      .filter((inc) => (tipo ? inc.Espacio?.tipo === tipo : true));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

// PATCH /api/incidencia/:id/estado  (auth + admin) — 100% local + evento.
export async function updateEstado(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const estado = (req.body?.estado as string | undefined)?.toLowerCase();
    const estadosValidos = ['reportado', 'mantenimiento', 'arreglado'];

    if (!estado || !estadosValidos.includes(estado)) {
      res.status(400).json({ msg: 'Estado inválido' });
      return;
    }

    const incidencia = await Incidencia.findByPk(id);
    if (!incidencia) {
      res.status(404).json({ msg: 'Incidencia no encontrada' });
      return;
    }

    incidencia.estado = estado;
    await incidencia.save();

    await events.publish('incidencia.estado_actualizada', {
      id_incidencia: incidencia.id_incidencia,
      estado,
    });

    res.json({ msg: 'Estado actualizado correctamente', incidencia });
  } catch (error) {
    console.error('ERROR REAL:', error);
    res.status(500).json({ error: (error as Error).message });
  }
}