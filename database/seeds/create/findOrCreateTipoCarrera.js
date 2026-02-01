import TipoCarrera from "../../../models/TipoCarrera.js";

export const findOrCreateTipoCarrera = async (nombre) => {
  return await TipoCarrera.findOrCreate({
      where: { nombre: nombre },
      defaults: {
        nombre: nombre
      }
    });
}
