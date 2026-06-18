import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { JwtUser } from '../types';

// Verificación de JWT 100% local: NO se llama a identity en cada request.
// Solo se valida la firma con el secreto compartido (mismo que emite identity).
export function auth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];
  if (!header) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }
  const token = header.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token inválido' });
    return;
  }
  try {
    req.user = jwt.verify(token, config.jwtSecret) as JwtUser;
    next();
  } catch {
    res.status(401).json({ message: 'Token no válido o expirado' });
  }
}

export function onlyAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.rol !== 3) {
    res.status(403).json({ message: 'Acceso solo para administradores' });
    return;
  }
  next();
}
