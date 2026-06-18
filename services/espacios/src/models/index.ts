import { Espacio } from './Espacio';
import { Equipo } from './Equipo';

Espacio.hasMany(Equipo, { foreignKey: 'id_espacio' });
Equipo.belongsTo(Espacio, { foreignKey: 'id_espacio' });

export { Espacio, Equipo };
