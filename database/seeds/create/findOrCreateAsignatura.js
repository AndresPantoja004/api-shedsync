import Asignatura from "../../../models/Asignatura.js";

export const findOrCreateAsignatura = async (data, profesor) => {
  return await Asignatura.findOrCreate({
      where: { nrc: data.nrc },
      defaults: {
        nombre: data.asignatura,
        nrc: data.nrc,
        id_profesor: profesor?.id_profesor
      }
    });
}
