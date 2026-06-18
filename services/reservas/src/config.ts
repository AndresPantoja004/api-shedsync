// Bun carga .env automáticamente; en Docker las vars vienen del compose.
export const config = {
  serviceName: process.env.SERVICE_NAME ?? 'reservas',
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  db: {
    name: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    dialect: 'postgres' as const,
  },
  amqpUrl: process.env.AMQP_URL ?? null,
};
