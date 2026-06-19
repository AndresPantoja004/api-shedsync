export interface JwtUser {
  id_usuario: number;
  rol: number;
  email?: string;
  [k: string]: unknown;
}

export type EspacioTipo = 'AULA' | 'LABORATORIO' | 'VIRTUAL' | 'OTRO';

export interface EspacioDTO {
  id_espacio: number;
  nombre: string | null;
  tipo: EspacioTipo;
  capacidad: number | null;
}

// Aumenta Express.Request para tipar req.user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}