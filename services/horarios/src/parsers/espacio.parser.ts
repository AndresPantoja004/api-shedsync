export interface EspacioParsed {
  tipo: 'AULA' | 'LABORATORIO' | 'VIRTUAL' | 'OTRO';
  nombre: string;
  capacidad: number | null;
}

// Normaliza la celda cruda del XLSX ("AULA A-12 07:00 - 09:00") a un espacio.
export function parseEspacio(raw: string | null): EspacioParsed | null {
  if (!raw) return null;

  const texto = raw
    .toUpperCase()
    .replace(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/g, '') // elimina horarios
    .replace(/\s+/g, ' ')
    .trim();

  if (texto.includes('VIRTUAL') || texto.includes('EN LINEA')) {
    return { tipo: 'VIRTUAL', nombre: 'VIRTUAL', capacidad: null };
  }

  const isLab = /LAB|LABORATORIO/.test(texto);
  const matchAula = texto.match(/AULA\s*([A-Z]?)-?(\d+)/);
  const aulaNombre = matchAula ? `${matchAula[1] || 'A'}${matchAula[2].padStart(2, '0')}` : null;

  if (isLab) {
    return { tipo: 'LABORATORIO', nombre: texto, capacidad: 25 };
  }

  if (aulaNombre) {
    return { tipo: 'AULA', nombre: aulaNombre, capacidad: 30 };
  }

  return { tipo: 'OTRO', nombre: texto, capacidad: null };
}
