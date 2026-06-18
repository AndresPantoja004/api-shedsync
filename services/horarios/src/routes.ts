import { Router, type Express } from 'express';
import { Horario } from './models';
import { importHorariosDesdeBuffer, type ImportResultado } from './import.service';

export default function mountRoutes(app: Express): void {
  const r = Router();
  r.get('/', async (_req, res) => {
    const rows = await Horario.findAll();
    res.json({ service: 'horarios', count: rows.length, items: rows });
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
