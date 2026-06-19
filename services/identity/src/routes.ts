import { Router, type Express } from 'express';
import { auth } from './middlewares/auth';
import * as authCtrl from './controllers/auth.controller';
import * as usuarioCtrl from './controllers/usuario.controller';
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
  // Usuario autenticado + datos académicos (composición HTTP a academico).
  userR.get('/', auth, usuarioCtrl.getById);
  // OJO: '/perfil' debe ir antes de cualquier '/:id'.
  userR.put('/perfil', auth, usuarioCtrl.updatePerfil);
  userR.post('/:id/asignar-rol', usuarioCtrl.asignarRol);
  app.use('/api/usuario', userR);
}
