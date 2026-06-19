import { buildApp } from './app';
import { config } from './config';
import { sequelize } from './db';
import './models'; // registra modelos + asociaciones internas del servicio
import mountRoutes from './routes';
import { seedCatalogos } from './seed.service';

async function connectWithRetry(retries = 12, delayMs = 3000): Promise<void> {
  for (let i = 1; i <= retries; i++) {
    try {
      await sequelize.authenticate();
      return;
    } catch {
      console.log(`[${config.serviceName}] BD no lista (intento ${i}/${retries})...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('No se pudo conectar a la base de datos');
}

try {
  await connectWithRetry();
  await sequelize.sync(); // scaffold: crea las tablas propias del servicio
  await seedCatalogos();  // siembra catálogos fijos (tipo_estudiante) requeridos por FKs
  const app = buildApp(mountRoutes);
  app.listen(config.port, () => console.log(`[${config.serviceName}] escuchando en :${config.port}`));
} catch (e) {
  console.error(`[${config.serviceName}] ERROR fatal:`, (e as Error).message);
  process.exit(1);
}
