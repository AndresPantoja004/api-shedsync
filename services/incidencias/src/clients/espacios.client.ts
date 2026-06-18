import { config } from '../config';
import type { EspacioDTO } from '../types';

const BASE = config.espaciosUrl;

async function getJson<T = unknown>(url: string, timeoutMs = 3000): Promise<T | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    // Degradación elegante: si espacios está caído, no tumbamos incidencias.
    return null;
  }
}

// GET /api/espacio/:id/exists -> { exists, espacio }
export async function espacioExists(id: number): Promise<boolean> {
  const data = await getJson<{ exists: boolean }>(`${BASE}/api/espacio/${id}/exists`);
  return Boolean(data?.exists);
}

export async function getEspacio(id: number): Promise<EspacioDTO | null> {
  const data = await getJson<{ espacio: EspacioDTO | null }>(`${BASE}/api/espacio/${id}/exists`);
  return data?.espacio ?? null;
}

// GET /api/espacio -> { items: Espacio[] }  ->  Map<id_espacio, EspacioDTO>
export async function getEspaciosMap(): Promise<Map<number, EspacioDTO>> {
  const data = await getJson<{ items: EspacioDTO[] }>(`${BASE}/api/espacio`);
  const items = data?.items ?? [];
  return new Map(items.map((e) => [e.id_espacio, e]));
}