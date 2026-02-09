import {Profesor} from '../../../models/index.js';

export const findOrCreateProfesor = async (data) => {
  let profesor = separarNombreCompleto(data);
  return await Profesor.findOrCreate({
    where: {
      nombres: profesor.nombres,
      apellidos: profesor.apellidos
    },
    defaults: {
      nombres: profesor.nombres,
      apellidos: profesor.apellidos
    }
  });
}

function separarNombreCompleto(texto) {
  let partes = texto.trim().split(/\s+/);

  return {
    nombres: partes.slice(2, 4).join(" "),
    apellidos: partes.slice(0, 2).join(" "),
  };
}
