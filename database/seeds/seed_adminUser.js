import { Usuario, UsuarioRol } from "../../models/index.js";
import { sequelize } from "../db_conection.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export async function seedAdminUser() {
    await sequelize.authenticate();

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASS, 10);

    const admin = await Usuario.create({
        email: "admin@sched.sync",
        password_hash: passwordHash
    });

    await UsuarioRol.create({
        id_usuario: admin.id_usuario,
        id_rol: 3
    });

    console.log("Admin creado correctamente");
}
