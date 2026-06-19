import { config } from './config';
import { Horario } from './models';
import { parseHorarioExcel, type HorarioRow } from './parsers/horario.parser';
import { parseNivelSemestre } from './parsers/periodo.parser';
import { parseEspacio } from './parsers/espacio.parser';

// Reemplaza a database/seeds/seed_horarios.js: ya no hay una sola BD, así que
// las entidades de otros contextos (carrera, semestre, profesor, asignatura,
// espacio) se resuelven con findOrCreate vía HTTP contra academico/espacios.

async function postJson<T = any>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`POST ${url} -> ${r.status}: ${text}`);
  }
  return r.json() as Promise<T>;
}

// --- helpers de agregación (antes en database/seeds/create/*) ---
const nombreCarrera = (rows: HorarioRow[]): string => rows[0]?.carrera ?? '';
const totalSemestres = (rows: HorarioRow[]): number => new Set(rows.map((r) => r.periodo)).size;
const duracionAnios = (totalSem: number): number => Math.ceil(totalSem / 2);

// "APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2" -> { nombres, apellidos }
function separarNombreCompleto(texto: string): { nombres: string; apellidos: string } {
  const partes = texto.trim().split(/\s+/);
  return { nombres: partes.slice(2, 4).join(' '), apellidos: partes.slice(0, 2).join(' ') };
}

export interface ImportResultado {
  archivo?: string;
  carrera: string;
  filas: number;
  horarios_creados: number;
}

export async function importHorariosDesdeBuffer(buffer: Buffer, archivo?: string): Promise<ImportResultado> {
  const ACA = config.academicoUrl;
  const ESP = config.espaciosUrl;

  const data = parseHorarioExcel(buffer);
  if (!data.length) {
    return { archivo, carrera: '', filas: 0, horarios_creados: 0 };
  }

  // 1) Catálogos de carrera (contexto academico).
  const tipo = await postJson(`${ACA}/api/tipo-carrera`, { nombre: 'Presencial' });
  const total = totalSemestres(data);
  const carrera = await postJson(`${ACA}/api/carrera`, {
    nombre: nombreCarrera(data),
    duracion_anios: duracionAnios(total),
    total_semestres: total,
    estado: true,
    id_tipo_carrera: tipo.id_tipo_carrera,
  });

  // 2) Semestres: nivel -> nº de asignaturas distintas (por código).
  const codigosPorNivel = new Map<number, Set<unknown>>();
  for (const h of data) {
    const nivel = parseNivelSemestre(h.periodo);
    if (!nivel) continue;
    if (!codigosPorNivel.has(nivel)) codigosPorNivel.set(nivel, new Set());
    codigosPorNivel.get(nivel)!.add(h.codigo);
  }

  const semestreIdByNivel: Record<number, number> = {};
  for (const [nivel, codigos] of codigosPorNivel) {
    const semestre = await postJson(`${ACA}/api/semestre`, {
      nivel,
      numero_asignaturas: codigos.size,
      id_carrera: carrera.id_carrera,
    });
    semestreIdByNivel[nivel] = semestre.id_semestre;
  }

  // 3) Por cada fila: profesor + asignatura (academico), espacio (espacios), horario (local).
  let creados = 0;
  for (const h of data) {
    if (h.docente?.includes('DOCENTE EDUCACIÓN')) continue;

    const nivel = parseNivelSemestre(h.periodo);
    const id_semestre = nivel ? semestreIdByNivel[nivel] : null;

    const profesor = await postJson(`${ACA}/api/profesor`, separarNombreCompleto(h.docente));
    const asignatura = await postJson(`${ACA}/api/asignatura`, {
      nrc: h.nrc,
      nombre: h.asignatura,
      id_profesor: profesor.id_profesor,
      id_semestre,
    });

    let id_espacio: number | null = null;
    const espParsed = parseEspacio(h.espacio);
    if (espParsed) {
      const espacio = await postJson(`${ESP}/api/espacio`, espParsed);
      id_espacio = espacio.id_espacio;
    }

    await Horario.create({
      dia: h.dia,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      id_asignatura: asignatura.id_asignatura,
      id_espacio,
    });
    creados++;
  }

  return { archivo, carrera: carrera.nombre, filas: data.length, horarios_creados: creados };
}
