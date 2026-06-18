import { config } from '../config';

const BASE = config.espaciosUrl;

export interface EspacioDTO {
  id_espacio: number;
  nombre: string;
  tipo: string;
  capacidad: number | null;
}

async function getJson<T = unknown>(url: string, timeoutMs = 3000): Promise<T | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    // Degradación elegante: si espacios está caído, no tumbamos horarios.
    return null;
  }
}

// GET /api/espacio -> Espacio[] (array directo) -> Map<id_espacio, EspacioDTO>
export async function getEspaciosMap(): Promise<Map<number, EspacioDTO>> {
  const items = await getJson<EspacioDTO[]>(`${BASE}/api/espacio`);
  return new Map((items ?? []).map((e) => [e.id_espacio, e]));
}
