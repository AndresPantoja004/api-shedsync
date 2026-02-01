export function parseNivelSemestre(periodo) {
  if (!periodo) return null;

  const mapa = {
    PRIMER: 1,
    SEGUNDO: 2,
    TERCER: 3,
    CUARTO: 4,
    QUINTO: 5,
    SEXTO: 6,
    SÉPTIMO: 7,
    SEPTIMO: 7,
    OCTAVO: 8,
    NOVENO: 9,
    DÉCIMO: 10,
    DECIMO: 10
  };

  const clave = periodo.split(' ')[0];
  return mapa[clave] ?? null;
}
