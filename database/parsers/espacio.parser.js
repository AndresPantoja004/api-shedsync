export function parseEspacio(raw) {

  if (!raw) return null;

  let texto = raw
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

  if (texto.includes("VIRTUAL") || texto.includes("EN LINEA")) {
    return { tipo: "virtual", nombre: "VIRTUAL" };
  }

  const isLab = /LAB|LABORATORIO/.test(texto);

  const matchAula = texto.match(/AULA\s*([A-Z]?-?\d+)/);

  if (isLab) {
    return {
      tipo: "laboratorio",
      nombre: texto,
      aulaCodigo: matchAula?.[1] || null
    };
  }

  if (matchAula) {
    return {
      tipo: "aula",
      codigo: matchAula[1]
    };
  }

  return {
    tipo: "otro",
    nombre: texto
  };
}
