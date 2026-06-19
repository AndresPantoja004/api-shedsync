import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { ServerResponse } from 'http';

const PORT = Number(process.env.PORT) || 8080;

// Destinos (en docker-compose se resuelven por nombre de servicio).
const targets = {
  identity: process.env.IDENTITY_URL || 'http://localhost:3001',
  academico: process.env.ACADEMICO_URL || 'http://localhost:3002',
  espacios: process.env.ESPACIOS_URL || 'http://localhost:3003',
  horarios: process.env.HORARIOS_URL || 'http://localhost:3004',
  reservas: process.env.RESERVAS_URL || 'http://localhost:3005',
  incidencias: process.env.INCIDENCIAS_URL || 'http://localhost:3006',
};

// Mapa de rutas públicas -> servicio destino (sin reescritura de path:
// cada servicio monta sus rutas en el MISMO prefijo /api/...).
const routeMap = [
  { prefixes: ['/api/auth', '/api/usuario'], target: targets.identity, name: 'identity' },
  { prefixes: ['/api/carrera', '/api/estudiante'], target: targets.academico, name: 'academico' },
  // reservas captura /api/espacio/reservar* ANTES que espacios:
  { prefixes: ['/api/espacio/reservar', '/api/reservas'], target: targets.reservas, name: 'reservas' },
  { prefixes: ['/api/espacio'], target: targets.espacios, name: 'espacios' },
  { prefixes: ['/api/horario'], target: targets.horarios, name: 'horarios' },
  { prefixes: ['/api/incidencia'], target: targets.incidencias, name: 'incidencias' },
];

const app = express();
app.use(helmet());
app.use(cors());                         // CORS centralizado aquí (antes en index.js)
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 })); // rate limiting centralizado

// Health agregado: estado del gateway + de cada servicio.
app.get('/health', async (_req: Request, res: Response) => {
  const checks = await Promise.all(
    Object.entries(targets).map(async ([name, url]) => {
      try {
        const r = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) });
        return [name, r.ok ? 'ok' : 'down'] as const;
      } catch {
        return [name, 'down'] as const;
      }
    })
  );
  res.json({ gateway: 'ok', services: Object.fromEntries(checks) });
});

// IMPORTANTE: el gateway NO parsea el body; lo deja fluir hacia el servicio.
for (const { prefixes, target, name } of routeMap) {
  app.use(
    createProxyMiddleware({
      pathFilter: (path: string) => prefixes.some((p) => path === p || path.startsWith(p + '/')),
      target,
      changeOrigin: true,
      on: {
        error: (_err: Error, _req: unknown, res: unknown) => {
          const out = res as ServerResponse;
          out.writeHead(502, { 'Content-Type': 'application/json' });
          out.end(JSON.stringify({ error: 'Servicio no disponible', servicio: name, target }));
        },
      },
    })
  );
}

app.use((req: Request, res: Response) =>
  res.status(404).json({ error: 'Ruta no enrutada por el gateway', path: req.path }));

app.listen(PORT, () => console.log(`[gateway] escuchando en :${PORT}`));
