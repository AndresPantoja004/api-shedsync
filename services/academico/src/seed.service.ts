import { TipoEstudiante } from './models';

// Catálogo fijo del que dependen otras inserciones por FK
// (estudiante_semestre.id_tipoestu -> tipo_estudiante.id_tipoestu).
// Se siembra al arrancar el servicio. Idempotente. Nombres inferidos: ajústalos
// si tu dominio usa otros (p. ej. REGULAR / ARRASTRE / REPITENTE).
const TIPOS_ESTUDIANTE = [
  { id_tipoestu: 1, nombre: 'Z' },
  { id_tipoestu: 2, nombre: 'C' },
];

export async function seedCatalogos(): Promise<void> {
  for (const t of TIPOS_ESTUDIANTE) {
    await TipoEstudiante.findOrCreate({ where: { id_tipoestu: t.id_tipoestu }, defaults: t });
  }
}
