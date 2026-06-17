require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

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
  { prefixes: ['/api/espacio'], target: targets.espacios, name: 'espacios' },
  { prefixes: ['/api/horario'], target: targets.horarios, name: 'horarios' },
  { prefixes: ['/api/reservas'], target: targets.reservas, name: 'reservas' },
  { prefixes: ['/api/incidencia'], target: targets.incidencias, name: 'incidencias' },
];

const app = express();
app.use(helmet());
app.use(cors());                         // CORS centralizado aquí (antes en index.js)
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 })); // rate limiting centralizado

// Health agregado: estado del gateway + de cada servicio.
app.get('/health', async (req, res) => {
  const checks = await Promise.all(
    Object.entries(targets).map(async ([name, url]) => {
      try {
        const r = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) });
        return [name, r.ok ? 'ok' : 'down'];
      } catch {
        return [name, 'down'];
      }
    })
  );
  res.json({ gateway: 'ok', services: Object.fromEntries(checks) });
});

// IMPORTANTE: el gateway NO parsea el body; lo deja fluir hacia el servicio.
for (const { prefixes, target, name } of routeMap) {
  app.use(
    createProxyMiddleware({
      pathFilter: (path) => prefixes.some((p) => path === p || path.startsWith(p + '/')),
      target,
      changeOrigin: true,
      on: {
        error: (err, req, res) => {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Servicio no disponible', servicio: name, target }));
        },
      },
    })
  );
}

app.use((req, res) => res.status(404).json({ error: 'Ruta no enrutada por el gateway', path: req.path }));

app.listen(PORT, () => console.log(`[gateway] escuchando en :${PORT}`));