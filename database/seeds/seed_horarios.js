const { sequelize } = require('../db_conection');
const parseHorarioExcel = require('../parsers/horario.parser');
const {Horario} = require('../../models/index.js');
const { findOrCreateProfesor } = require('./create/findOrCreateProfesor');
const { findOrCreateAsignatura } = require('./create/findOrCreateAsignatura');
const { findOrCreateEspacio } = require('./create/findOrCreateEspacio');
const { findOrCreateTipoCarrera } = require('./create/findOrCreateTipoCarrera');
const { findOrCreateCarrera } = require('./create/findOrCreateCarrera');
const { findOrCreateSemestre } = require('./create/findOrCreateSemestre');
const { parseNivelSemestre } = require('../parsers/periodo.parser');

async function seedHorarios(file) {
  await sequelize.authenticate();

  const data = parseHorarioExcel(file);

  const [tipo_carrera] = await findOrCreateTipoCarrera('Presencial');
  const [carrera] = await findOrCreateCarrera(data, tipo_carrera.id_tipo_carrera);
  const semestreIdByNivel = await findOrCreateSemestre(data, carrera.id_carrera);

  for (const h of data) {
    if (h.docente?.includes('DOCENTE EDUCACIÓN')) continue;

    const id_semestre = semestreIdByNivel[parseNivelSemestre(h.periodo)];
    const [profesor] = await findOrCreateProfesor(h.docente);
    const [asignatura] = await findOrCreateAsignatura(h, profesor, id_semestre);
    const espacio = await findOrCreateEspacio(h.espacio);

    await Horario.create({
      dia: h.dia,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      id_asignatura: asignatura.id_asignatura,
      id_aula: espacio?.aula?.id_aula ?? null,
      id_laboratorio: espacio?.laboratorio?.id_laboratorio ?? null
    });
  }

  console.log('✅ Horarios cargados automáticamente');
  process.exit(0);
}

seedHorarios('./database/horarios/HORARIO_BIOT_202551.xlsx');
seedHorarios('./database/horarios/HORARIO_AGRO_202551.xlsx');
seedHorarios('./database/horarios/HORARIO_ITIJ_202551.xlsx');