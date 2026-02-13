import {Asignatura} from "../../../models/index.js";

export const findOrCreateAsignatura = async (data, profesor, id_semestre) => {
  return await Asignatura.findOrCreate({
      where: { nrc: data.nrc },
      defaults: {
        nombre: data.asignatura,
        nrc: data.nrc,
        id_profesor: profesor?.id_profesor,
        id_semestre
      }
    });
}
