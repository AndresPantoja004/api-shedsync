import { Router, type Express } from 'express';
import { Usuario } from './models';
import { auth } from './middlewares/auth';
import * as authCtrl from './controllers/auth.controller';
import { seedAdmin } from './seed.service';

export default function mountRoutes(app: Express): void {
  // --- /api/auth ---
  const authR = Router();
  authR.post('/login', authCtrl.login);
  authR.post('/register', authCtrl.register);
  // Seed idempotente del admin inicial (reemplaza a seed_adminUser.js).
  authR.post('/seed-admin', async (_req, res) => {
    try {
      res.json({ ok: true, ...(await seedAdmin()) });
    } catch (e) {
      res.status(500).json({ ok: false, error: (e as Error).message });
    }
  });
  app.use('/api/auth', authR);

  // --- /api/usuario ---
  const userR = Router();
  userR.get('/', auth, async (_req, res) => {
    const users = await Usuario.findAll({ attributes: ['id_usuario', 'email', 'phone', 'activo'] });
    res.json({ service: 'identity', count: users.length, items: users });
  });
  app.use('/api/usuario', userR);
}
