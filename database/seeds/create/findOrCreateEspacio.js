import Laboratorio from "../../../models/Laboratorio.js";
import Aula from "../../../models/Aula.js";
import { parseEspacio } from "../../parsers/espacio.parser.js";

export const findOrCreateEspacio = async (data) => {
    const parsed = parseEspacio(data);

    let espacio;

    if (!parsed) return;

    if (parsed.tipo === "laboratorio") {
        espacio = await Laboratorio.findOrCreate({
            where: { nombre: parsed.nombre }
        });

    } else if (parsed.tipo === "aula") {
        espacio = await Aula.findOrCreate({
            where: { codigo: parsed.codigo }
        });

    } else if (parsed.tipo === "virtual") {
        espacio = { virtual: true };
    }
    return espacio;
}
