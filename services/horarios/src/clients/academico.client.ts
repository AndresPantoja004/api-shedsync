import { config } from '../config';

const BASE = config.academicoUrl;

export interface AsignaturaDTO {
  id_asignatura: number;
  nombre: string;
}

async function getJson<T = unknown>(url: string, timeoutMs = 3000): Promise<T | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    // Degradación elegante: si academico está caído, no tumbamos horarios.
    return null;
  }
}

// GET /api/estudiante/:id/asignaturas -> [{ id_asignatura, nombre }]
export async function getAsignaturasByEstudiante(
  idEstudiante: number | string,
): Promise<AsignaturaDTO[]> {
  const items = await getJson<AsignaturaDTO[]>(
    `${BASE}/api/estudiante/${idEstudiante}/asignaturas`,
  );
  return items ?? [];
}

// GET /api/asignatura -> [{ id_asignatura, nombre, nrc }] -> Map<id_asignatura, AsignaturaDTO>
export async function getAsignaturasMap(): Promise<Map<number, AsignaturaDTO>> {
  const items = await getJson<AsignaturaDTO[]>(`${BASE}/api/asignatura`);
  return new Map((items ?? []).map((a) => [a.id_asignatura, a]));
}
