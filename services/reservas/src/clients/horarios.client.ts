import { config } from '../config';

const BASE = config.horariosUrl;

async function getJson<T = unknown>(url: string, timeoutMs = 3000): Promise<T | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    // Degradación elegante: si horarios está caído, no bloqueamos la reserva.
    return null;
  }
}

// GET /api/horario/conflicto?id_espacio=&dia=&hora_inicio=&hora_fin= -> { conflicto: boolean }
export async function hayConflictoHorario(params: {
  id_espacio: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}): Promise<boolean> {
  const qs = new URLSearchParams({
    id_espacio: String(params.id_espacio),
    dia: params.dia,
    hora_inicio: params.hora_inicio,
    hora_fin: params.hora_fin,
  });
  const data = await getJson<{ conflicto: boolean }>(`${BASE}/api/horario/conflicto?${qs.toString()}`);
  return Boolean(data?.conflicto);
}
