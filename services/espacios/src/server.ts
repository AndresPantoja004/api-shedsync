const buildApp = require('./app');
const config = require('./config');
const { sequelize } = require('./db');
require('./models'); // registra modelos + asociaciones internas del servicio
const mountRoutes = require('./routes');

async function connectWithRetry(retries = 12, delayMs = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await sequelize.authenticate();
      return;
    } catch (e) {
      console.log(`[${config.serviceName}] BD no lista (intento ${i}/${retries})...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('No se pudo conectar a la base de datos');
}

(async () => {
  try {
    await connectWithRetry();
    await sequelize.sync(); // scaffold: crea las tablas propias del servicio
    const app = buildApp(mountRoutes);
    app.listen(config.port, () =>
      console.log(`[${config.serviceName}] escuchando en :${config.port}`)
    );
  } catch (e) {
    console.error(`[${config.serviceName}] ERROR fatal:`, e.message);
    process.exit(1);
  }
})();