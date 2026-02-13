const { sequelize } = require('./db_conection');

require('../models');

const iniciar = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas creadas / actualizadas');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

iniciar();
