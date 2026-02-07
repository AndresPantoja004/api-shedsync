export function parseEspacio(raw) {
  if (!raw) return null;

  let texto = raw
    .toUpperCase()
    .replace(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/g, "") // elimina horarios
    .replace(/\s+/g, " ")
    .trim();

  if (texto.includes("VIRTUAL") || texto.includes("EN LINEA")) {
    return {
      tipo: "virtual",
      nombre: "VIRTUAL",
      capacidad: null
    };
  }

  const isLab = /LAB|LABORATORIO/.test(texto);

  const matchAula = texto.match(/AULA\s*([A-Z]?)-?(\d+)/);

  const aulaCodigo = matchAula
    ? `${matchAula[1] || "A"}${matchAula[2].padStart(2, "0")}`
    : null;

  if (isLab) {
    return {
      tipo: "laboratorio",
      nombre: texto,
      capacidad: 25
    };
  }

  if (aulaCodigo) {
    return {
      tipo: "aula",
      codigo: aulaCodigo,
      capacidad: 30
    };
  }

  return {
    tipo: "otro",
    nombre: texto,
    capacidad: null
  };
}
