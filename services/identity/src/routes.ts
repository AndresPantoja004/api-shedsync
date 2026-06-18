import { Router, type Express } from 'express';
import { Usuario } from './models';
import { auth } from './middlewares/auth';

export default function mountRoutes(app: Express): void {
  // --- /api/auth ---
  const authR = Router();
  authR.post('/login', (_req, res) =>
    res.status(501).json({ message: 'Pendiente fase 2: auth.login (compone datos académicos vía academico)' }));
  authR.post('/register', (_req, res) =>
    res.status(501).json({ message: 'Pendiente fase 2: auth.register' }));
  app.use('/api/auth', authR);

  // --- /api/usuario ---
  const userR = Router();
  userR.get('/', auth, async (_req, res) => {
    const users = await Usuario.findAll({ attributes: ['id_usuario', 'email', 'phone', 'activo'] });
    res.json({ service: 'identity', count: users.length, items: users });
  });
  app.use('/api/usuario', userR);
}
