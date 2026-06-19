import { Router, type Express } from 'express';
import { Op } from 'sequelize';
import { Horario } from './models';
import { importHorariosDesdeBuffer, type ImportResultado } from './import.service';
import * as academico from './clients/academico.client';
import * as espacios from './clients/espacios.client';

const ordenDias: Record<string, number> = {
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
};

export default function mountRoutes(app: Express): void {
  const r = Router();

  r.get('/', async (req, res) => {
    // Acepta ?dia=... para filtrar (lo usa espacios); si no, devuelve todo.
    const where = req.query.dia ? { dia: String(req.query.dia) } : undefined;
    const rows = await Horario.findAll(where ? { where } : undefined);
    res.json({ service: 'horarios', count: rows.length, items: rows });
  });

  // Detecta solapamiento de horario en un espacio. Lo consume reservas.
  // Query: id_espacio, dia, hora_inicio, hora_fin -> { conflicto: boolean }
  r.get('/conflicto', async (req, res) => {
    const { id_espacio, dia, hora_inicio, hora_fin } = req.query;
    const found = await Horario.findOne({
      where: {
        id_espacio,
        dia,
        hora_inicio: { [Op.lt]: hora_fin },
        hora_fin: { [Op.gt]: hora_inicio },
      } as any,
    });
    res.json({ conflicto: Boolean(found) });
  });

  // TODOS los horarios (no específico del estudiante; así era el monolito) con su asignatura.
  r.get('/estudiante/:id/semanal', async (_req, res) => {
    const horarios = await Horario.findAll({
      order: [
        ['dia', 'ASC'],
        ['hora_inicio', 'ASC'],
      ],
    });
    const asignaturasMap = await academico.getAsignaturasMap();
    const result = horarios.map((h) => {
      const a = h.id_asignatura != null ? asignaturasMap.get(h.id_asignatura) : undefined;
      return {
        ...h.toJSON(),
        Asignatura: a ? { id_asignatura: a.id_asignatura, nombre: a.nombre } : null,
      };
    });
    res.json(result);
  });

  // Horarios del estudiante (según sus asignaturas en academico).
  r.get('/estudiante/:id', async (req, res) => {
    const asignaturas = await academico.getAsignaturasByEstudiante(req.params.id);
    const ids = asignaturas.map((a) => a.id_asignatura);
    if (!ids.length) {
      res.json([]);
      return;
    }
    const nombreById = new Map(asignaturas.map((a) => [a.id_asignatura, a.nombre]));
    const horarios = await Horario.findAll({ where: { id_asignatura: { [Op.in]: ids } } as any });
    const result = horarios.map((h) => ({
      ...h.toJSON(),
      Asignatura: {
        id_asignatura: h.id_asignatura,
        nombre: h.id_asignatura != null ? (nombreById.get(h.id_asignatura) ?? null) : null,
      },
    }));
    res.json(result);
  });

  // Horario completo del estudiante con asignatura y espacio, deduplicado y ordenado.
  r.get('/:id/estudiante', async (req, res) => {
    const asignaturas = await academico.getAsignaturasByEstudiante(req.params.id);
    const ids = asignaturas.map((a) => a.id_asignatura);
    if (!ids.length) {
      res.json([]);
      return;
    }

    const horarios = await Horario.findAll({
      where: { id_asignatura: { [Op.in]: ids } } as any,
      order: [
        ['dia', 'ASC'],
        ['hora_inicio', 'ASC'],
      ],
    });

    const nombreById = new Map(asignaturas.map((a) => [a.id_asignatura, a.nombre]));
    const espaciosMap = await espacios.getEspaciosMap();

    const enriquecidos = horarios.map((h) => {
      const json = h.toJSON();
      const nombre = h.id_asignatura != null ? nombreById.get(h.id_asignatura) : undefined;
      const esp = h.id_espacio != null ? espaciosMap.get(h.id_espacio) : undefined;
      return {
        ...json,
        Asignatura: nombre != null ? { nombre } : null,
        Espacio: esp ? { nombre: esp.nombre, tipo: esp.tipo, capacidad: esp.capacidad } : null,
      };
    });

    // Eliminar duplicados manteniendo el primero.
    const seen = new Set<string>();
    const unique = enriquecidos.filter((h) => {
      const key = `${h.dia}-${h.hora_inicio}-${h.hora_fin}-${h.id_asignatura}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    unique.sort((a, b) => {
      const da = ordenDias[a.dia ?? ''] ?? 99;
      const db = ordenDias[b.dia ?? ''] ?? 99;
      if (da !== db) return da - db;
      return (a.hora_inicio ?? '').localeCompare(b.hora_inicio ?? '');
    });

    res.json(unique);
  });

  // Sube uno o varios XLSX en base64 y orquesta la carga (academico + espacios).
  // Body: { archivos: [{ nombre?, contenidoBase64 }, ...] }  ó  { nombre?, contenidoBase64 }
  // Sin auth a propósito: identity.login sigue en stub (fase 2), así es demoable.
  r.post('/import', async (req, res) => {
    const body = req.body ?? {};
    const archivos: Array<{ nombre?: string; contenidoBase64?: string }> =
      Array.isArray(body.archivos)
        ? body.archivos
        : body.contenidoBase64
          ? [{ nombre: body.nombre, contenidoBase64: body.contenidoBase64 }]
          : [];

    if (!archivos.length) {
      res.status(400).json({ message: 'Falta contenidoBase64 (o archivos[]) con el XLSX' });
      return;
    }

    try {
      const resultados: ImportResultado[] = [];
      for (const a of archivos) {
        if (!a.contenidoBase64) continue;
        const buffer = Buffer.from(a.contenidoBase64, 'base64');
        resultados.push(await importHorariosDesdeBuffer(buffer, a.nombre));
      }
      res.json({ ok: true, resultados });
    } catch (e) {
      res.status(502).json({ ok: false, error: (e as Error).message });
    }
  });

  app.use('/api/horario', r);
}
