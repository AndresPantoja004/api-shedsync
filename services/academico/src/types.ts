export interface JwtUser {
  id_usuario: number;
  rol: number;
  email?: string;
  [k: string]: unknown;
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
