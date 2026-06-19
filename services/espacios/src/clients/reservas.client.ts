import { config } from '../config';

const BASE = config.reservasUrl;

export interface Reserva {
  id_espacio: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
}

async function getJson<T = unknown>(url: string, timeoutMs = 3000): Promise<T | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    // Degradación elegante: si reservas está caído, no tumbamos espacios.
    return null;
  }
}

// GET /api/reservas?fecha=&estado=APROBADA -> Reserva[] (array directo)
export async function getReservasAprobadas(fecha: string): Promise<Reserva[]> {
  const data = await getJson<Reserva[]>(
    `${BASE}/api/reservas?fecha=${encodeURIComponent(fecha)}&estado=APROBADA`,
  );
  return data ?? [];
}
