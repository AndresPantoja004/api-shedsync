import Laboratorio from "../../../models/Laboratorio.js";
import Aula from "../../../models/Aula.js";
import { parseEspacio } from "../../parsers/espacio.parser.js";

export const findOrCreateEspacio = async (data) => {
  const parsed = parseEspacio(data);
  if (!parsed) return null;

  if (parsed.tipo === "aula") {
    const [aula] = await Aula.findOrCreate({
      where: { codigo: parsed.codigo },
      defaults: {
        tipo: "aula",
        capacidad: parsed.capacidad ?? 30
      }
    });

    return { aula };
  }

  if (parsed.tipo === "laboratorio") {
    let aula = null;

    if (parsed.aulaCodigo) {
      [aula] = await Aula.findOrCreate({
        where: { codigo: parsed.aulaCodigo },
        defaults: {
          tipo: "aula",
          capacidad: 30
        }
      });
    }

    const [laboratorio] = await Laboratorio.findOrCreate({
      where: { nombre: parsed.nombre },
      defaults: {
        tipo: "laboratorio",
        capacidad: parsed.capacidad ?? 25,
        id_aula: aula?.id_aula ?? null
      }
    });

    return { laboratorio, aula };
  }

  if (parsed.tipo === "virtual") {
    return { virtual: true };
  }

  return null;
};
