import { config } from '../config';

const BASE = config.horariosUrl;

export interface Horario {
  id_horario: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  id_espacio: number;
  id_asignatura?: number | null;
}

async function getJson<T = unknown>(url: string, timeoutMs = 3000): Promise<T | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    // Degradación elegante: si horarios está caído, no tumbamos espacios.
    return null;
  }
}

// GET /api/horario?dia= -> { items: Horario[] }
export async function getHorariosByDia(dia: string): Promise<Horario[]> {
  const data = await getJson<{ items: Horario[] }>(
    `${BASE}/api/horario?dia=${encodeURIComponent(dia)}`,
  );
  return data?.items ?? [];
}
