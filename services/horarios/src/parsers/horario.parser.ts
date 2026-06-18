import * as XLSX from 'xlsx';

export interface HorarioRow {
  carrera: string;
  periodo: string | null;
  nrc: string;
  codigo: unknown;
  asignatura: unknown;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  espacio: string;
  docente: string;
}

// Igual que el parser del monolito, pero lee desde un Buffer (lo sube el cliente
// vía /import) en vez de una ruta de disco.
export function parseHorarioExcel(buffer: Buffer): HorarioRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

  let periodo: string | null = null;
  let carrera = '';
  const horarios: HorarioRow[] = [];

  for (const row of rows) {
    if (!row.length) continue;

    if (typeof row[0] === 'string' && row[0].includes('CARRERA')) {
      carrera = row[0].match(/CARRERA DE (.+)/i)?.[1] ?? '';
      continue;
    }
    if (typeof row[0] === 'string' && row[0].includes('PERIODO')) {
      periodo = row[0];
      continue;
    }

    if (!isNaN(Number(row[1]))) {
      const [, nrc, codigo, asignatura, lunes, martes, miercoles, jueves, viernes, docente] = row;

      const dias: Record<string, unknown> = {
        LUNES: lunes,
        MARTES: martes,
        MIERCOLES: miercoles,
        JUEVES: jueves,
        VIERNES: viernes,
      };

      for (const [dia, valor] of Object.entries(dias)) {
        if (!valor) continue;
        const data = parseHorario(String(valor));
        if (!data) continue;

        horarios.push({
          carrera,
          periodo,
          nrc: String(nrc),
          codigo,
          asignatura,
          dia,
          ...data,
          docente: String(docente ?? ''),
        });
      }
    }
  }

  return horarios;
}

function parseHorario(texto: string): { hora_inicio: string; hora_fin: string; espacio: string } | null {
  texto = texto.replace(/\s+/g, ' ').trim();

  const match = texto.match(/(\d{2}[:h]\d{2})\s*-\s*(\d{2}[:h]\d{2})/i);
  if (!match) return null;

  const hora_inicio = match[1].replace('h', ':');
  const hora_fin = match[2].replace('h', ':');
  const espacio = texto.replace(match[0], '').trim();

  return { hora_inicio, hora_fin, espacio };
}
