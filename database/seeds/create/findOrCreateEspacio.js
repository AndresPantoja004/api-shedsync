import { Espacio } from "../../../models/index.js";
import { parseEspacio } from "../../parsers/espacio.parser.js";

export const findOrCreateEspacio = async (data) => {
  const parsed = parseEspacio(data);
  if (!parsed) return null;

  return await Espacio.findOrCreate({
    where: { nombre: parsed.nombre },
    defaults: {
      tipo: parsed.tipo,
      capacidad: parsed.capacidad
    }
  });
};
