const { sequelize } = require('../db_conection');
const parseHorarioExcel = require('../parsers/horario.parser');
const Profesor = require('../../models/Profesor');
const Asignatura = require('../../models/Asignatura');
const Aula = require('../../models/Aula');
const Laboratorio = require('../../models/Laboratorio');
const Horario = require('../../models/Horario');
const { findOrCreateProfesor } = require('./create/findOrCreateProfesor');
const { findOrCreateAsignatura } = require('./create/findOrCreateAsignatura');
const { findOrCreateEspacio } = require('./create/findOrCreateEspacio');

async function seedHorarios() {
  await sequelize.authenticate();

  const data = parseHorarioExcel('./database/horarios/HORARIO_BIOT_202551.xlsx');

  for (const h of data) {
    if (h.docente.includes('DOCENTE EDUCACIÓN')) continue;

    const [profesor] = await findOrCreateProfesor(h.docente);

    const [asignatura] = await findOrCreateAsignatura(h, profesor)

    console.log(h.espacio)

    const espacio = await findOrCreateEspacio(h.espacio);

    await Horario.create({
      dia: h.dia,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      id_asignatura: asignatura.id_asignatura,
      id_aula: espacio[0]?.id_aula,
      id_laboratorio: espacio[0]?.id_laboratorio
    });
  }

  console.log('✅ Horarios cargados automáticamente');
  process.exit(0);
}

seedHorarios();