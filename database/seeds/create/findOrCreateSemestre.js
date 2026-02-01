const Semestre = require('../../../models/Semestre');
const { parseNivelSemestre } = require('../../parsers/periodo.parser');

async function findOrCreateSemestre(data, id_carrera) {
  const semestresMap = {};
  const semestreIdByNivel = {};

  for (const h of data) {
    const nivel = parseNivelSemestre(h.periodo);
    if (!nivel) continue;

    if (!semestresMap[nivel]) {
      semestresMap[nivel] = new Set();
    }

    semestresMap[nivel].add(h.codigo);
  }

  for (const [nivel, asignaturas] of Object.entries(semestresMap)) {
    const [semestre] = await Semestre.findOrCreate({
      where: {
        id_carrera,
        nivel: Number(nivel)
      },
      defaults: {
        nivel: Number(nivel),
        numero_asignaturas: asignaturas.size,
        id_carrera
      }
    });

    semestreIdByNivel[nivel] = semestre.id_semestre;
  }

  return semestreIdByNivel;
}


module.exports = { findOrCreateSemestre };