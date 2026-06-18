import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';

export function buildApp(mountRoutes?: (app: Express) => void): Express {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(morgan('dev'));

  app.get('/health', (_req, res) =>
    res.json({ service: config.serviceName, status: 'ok', uptime: process.uptime() }),
  );

  if (mountRoutes) mountRoutes(app);

  app.use((req, res) =>
    res.status(404).json({ error: 'Not found', service: config.serviceName, path: req.path }),
  );
  return app;
}