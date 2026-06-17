const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');

// Construye la app Express base. El gateway centraliza CORS/rate-limit,
// pero cada servicio se mantiene autónomo y arrancable por sí solo.
function buildApp(mountRoutes) {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));        // base64 de imágenes (incidencias, avatar)
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(morgan('dev'));

  app.get('/health', (req, res) =>
    res.json({ service: config.serviceName, status: 'ok', uptime: process.uptime() })
  );

  if (mountRoutes) mountRoutes(app);

  app.use((req, res) =>
    res.status(404).json({ error: 'Not found', service: config.serviceName, path: req.path })
  );
  return app;
}

module.exports = buildApp;