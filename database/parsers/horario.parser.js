const XLSX = require('xlsx');

function parseHorarioExcel(path) {
  const workbook = XLSX.readFile(path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  let periodo = null;
  let horarios = [];
  let carrera = "";

  for (const row of rows) {
    if (!row.length) continue;

    if (typeof row[0] === 'string' && row[0].includes('CARRERA')) {
      carrera = row[0].match(/CARRERA DE (.+)/i)?.[1];
      continue;
    }
    if (typeof row[0] === 'string' && row[0].includes('PERIODO')) {
      periodo = row[0];
      continue;
    }

    if (!isNaN(row[1])) {
      const [
        ,
        nrc,
        codigo,
        asignatura,
        lunes,
        martes,
        miercoles,
        jueves,
        viernes,
        docente
      ] = row;

      const dias = {
        LUNES: lunes,
        MARTES: martes,
        MIERCOLES: miercoles,
        JUEVES: jueves,
        VIERNES: viernes
      };

      Object.entries(dias).forEach(([dia, valor]) => {
        if (!valor) return;

        let data = parseHorario(valor);
        if (!data) return;

        horarios.push({
          carrera,
          periodo,
          nrc: String(nrc),
          codigo,
          asignatura,
          dia,
          ...data,
          docente
        });
      });

    }
  }


  return horarios;
}

function parseHorario(texto) {

  texto = texto.replace(/\s+/g, " ").trim();

  const match = texto.match(/(\d{2}[:h]\d{2})\s*-\s*(\d{2}[:h]\d{2})/i);

  if (!match) return null;

  let hora_inicio = match[1].replace("h", ":");
  let hora_fin = match[2].replace("h", ":");
  let espacio = texto.replace(match[0], "").trim();

  return {
    hora_inicio,
    hora_fin,
    espacio
  };
}

module.exports = parseHorarioExcel;