import { Sequelize, DataTypes } from 'sequelize';
import { config } from './config';

// Conexión propia a la BD propia de incidencias. Sin tablas compartidas.
export const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: config.db.dialect,
  logging: false,
});

export { DataTypes };