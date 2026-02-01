import Carrera from "../../../models/Carrera.js";

export const findOrCreateCarrera = async (data, id_tipo_carrera) => {
  const nombre = nombre_carrera(data);
  const total_semestres = semester_count(data);
  const duracion_anios = duracion(total_semestres);

  return await Carrera.findOrCreate({
      where: { nombre },
      defaults: {
        nombre,
        duracion_anios,
        total_semestres,
        estado: true,
        id_tipo_carrera
      }
    });
}

const duracion = (semestres)=>{
  return Math.ceil(semestres/2);
}

const semester_count = (data)=>{
  let semestres = [
    ...new Set(data.map(item => item.periodo))
  ];
  return semestres.length;
}

const nombre_carrera = (data)=>{
  return data[0]?.carrera;
} 