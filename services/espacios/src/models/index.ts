const Espacio = require('./Espacio');
const Equipo = require('./Equipo');

Espacio.hasMany(Equipo, { foreignKey: 'id_espacio' });
Equipo.belongsTo(Espacio, { foreignKey: 'id_espacio' });

module.exports = { Espacio, Equipo };