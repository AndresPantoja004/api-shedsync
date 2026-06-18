import { Sequelize, DataTypes } from 'sequelize';
import { config } from './config';

// Cada servicio tiene SU PROPIA conexión a SU PROPIA base de datos.
// No hay tablas compartidas ni FKs físicas hacia otros contextos.
export const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: config.db.dialect,
  logging: false,
});

export { DataTypes };
