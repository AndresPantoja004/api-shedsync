import { Router, type Express } from 'express';
import { Carrera, Estudiante, TipoCarrera, Semestre, Profesor, Asignatura } from './models';

export default function mountRoutes(app: Express): void {
  const carreraR = Router();
  carreraR.get('/', async (_req, res) => {
    const rows = await Carrera.findAll();
    res.json({ service: 'academico', recurso: 'carrera', count: rows.length, items: rows });
  });
  // findOrCreate idempotente (lo consume horarios al importar el XLSX).
  carreraR.post('/', async (req, res) => {
    const { nombre, duracion_anios, total_semestres, estado, id_tipo_carrera } = req.body ?? {};
    const [carrera] = await Carrera.findOrCreate({
      where: { nombre },
      // id_tipo_carrera lo inyecta la asociación, no está en InferAttributes<Carrera>:
      defaults: { nombre, duracion_anios, total_semestres, estado, id_tipo_carrera } as any,
    });
    res.json(carrera);
  });
  app.use('/api/carrera', carreraR);

  // --- tipo de carrera (catálogo) ---
  const tipoR = Router();
  tipoR.post('/', async (req, res) => {
    const [tipo] = await TipoCarrera.findOrCreate({
      where: { nombre: req.body?.nombre },
      defaults: { nombre: req.body?.nombre },
    });
    res.json(tipo);
  });
  app.use('/api/tipo-carrera', tipoR);

  // --- semestre ---
  const semR = Router();
  semR.post('/', async (req, res) => {
    const { nivel, numero_asignaturas, id_carrera } = req.body ?? {};
    const [semestre] = await Semestre.findOrCreate({
      // id_carrera lo inyecta la asociación, no está en InferAttributes<Semestre>:
      where: { id_carrera, nivel } as any,
      defaults: { nivel, numero_asignaturas, id_carrera } as any,
    });
    res.json(semestre);
  });
  app.use('/api/semestre', semR);

  // --- profesor ---
  const profR = Router();
  profR.post('/', async (req, res) => {
    const { nombres, apellidos, email } = req.body ?? {};
    const [profesor] = await Profesor.findOrCreate({
      where: { nombres, apellidos },
      defaults: { nombres, apellidos, email } as any,
    });
    res.json(profesor);
  });
  app.use('/api/profesor', profR);

  // --- asignatura ---
  const asigR = Router();
  asigR.post('/', async (req, res) => {
    const { nrc, nombre, id_profesor, id_semestre } = req.body ?? {};
    const [asignatura] = await Asignatura.findOrCreate({
      where: { nrc },
      // id_profesor / id_semestre los inyectan las asociaciones:
      defaults: { nombre, nrc, id_profesor, id_semestre } as any,
    });
    res.json(asignatura);
  });
  app.use('/api/asignatura', asigR);

  const estR = Router();
  estR.get('/', async (_req, res) => {
    const rows = await Estudiante.findAll();
    res.json({ service: 'academico', recurso: 'estudiante', count: rows.length, items: rows });
  });
  // Endpoint pensado para que el gateway/identity COMPONGA el login:
  estR.get('/by-usuario/:id_usuario', async (req, res) => {
    const est = await Estudiante.findOne({
      where: { id_usuario: req.params.id_usuario },
      include: [{ model: Carrera, attributes: ['nombre'] }],
    });
    if (!est) {
      res.status(404).json({ message: 'Sin estudiante para ese usuario' });
      return;
    }
    res.json(est);
  });
  app.use('/api/estudiante', estR);
}
