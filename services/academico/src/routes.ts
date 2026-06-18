import { Router, type Express } from 'express';
import {
  Carrera, Estudiante, TipoCarrera, Semestre, Profesor, Asignatura,
  EstudianteSemestre, TipoEstudiante,
} from './models';
import { auth } from './middlewares/auth';

export default function mountRoutes(app: Express): void {
  const carreraR = Router();
  carreraR.get('/', async (_req, res) => {
    const rows = await Carrera.findAll({ include: TipoCarrera });
    res.json(rows);
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
  // Semestres de una carrera (con sus asignaturas). Devuelve array crudo, como el monolito.
  carreraR.get('/:id/semestre', async (req, res) => {
    try {
      const semestres = await Semestre.findAll({
        where: { id_carrera: req.params.id } as any,
        include: [{ model: Asignatura, as: 'asignaturas' }],
        order: [['nivel', 'ASC']],
      });
      res.json(semestres);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });
  carreraR.get('/:id', async (req, res) => {
    const carrera = await Carrera.findByPk(req.params.id, { include: TipoCarrera });
    if (!carrera) {
      res.status(404).json({ msg: 'Carrera no encontrada' });
      return;
    }
    res.json(carrera);
  });
  carreraR.put('/:id', async (req, res) => {
    try {
      await Carrera.update(req.body, { where: { id_carrera: req.params.id } as any });
      res.json({ msg: 'Carrera actualizada' });
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });
  carreraR.delete('/:id', async (req, res) => {
    try {
      await Carrera.destroy({ where: { id_carrera: req.params.id } as any });
      res.json({ msg: 'Carrera eliminada' });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
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
  asigR.get('/', async (_req, res) => {
    const rows = await Asignatura.findAll({ attributes: ['id_asignatura', 'nombre', 'nrc'] });
    res.json(rows);
  });
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
  // Lo específico ANTES que '/:id...'.
  estR.get('/all', async (_req, res) => {
    const rows = await Estudiante.findAll({ include: Carrera });
    res.json(rows);
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
  estR.get('/:id/semestres', async (req, res) => {
    const rows = await EstudianteSemestre.findAll({
      where: { id_estudiante: req.params.id } as any,
      attributes: ['id_estudiante'],
      include: [
        { model: Semestre, attributes: ['id_semestre', 'nivel'] },
        { model: Asignatura, attributes: ['id_asignatura', 'nombre'] },
        { model: TipoEstudiante, attributes: ['id_tipoestu', 'nombre'] },
      ],
    });
    res.json(rows);
  });
  // Asignaturas DISTINTAS de un estudiante (lo consume horarios para componer).
  estR.get('/:id/asignaturas', async (req, res) => {
    const rows = await EstudianteSemestre.findAll({
      where: { id_estudiante: req.params.id } as any,
      include: [{ model: Asignatura, attributes: ['id_asignatura', 'nombre'] }],
    });
    const seen = new Set<number>();
    const asignaturas: { id_asignatura: number; nombre: string }[] = [];
    for (const row of rows) {
      const asig = (row as any).Asignatura as Asignatura | undefined;
      if (asig && !seen.has(asig.id_asignatura)) {
        seen.add(asig.id_asignatura);
        asignaturas.push({ id_asignatura: asig.id_asignatura, nombre: asig.nombre });
      }
    }
    res.json(asignaturas);
  });
  estR.post('/:id/semestres', async (req, res) => {
    try {
      const { id_tipoestu, asignaturas } = req.body ?? {};
      const data = (asignaturas ?? []).map((a: any) => ({
        id_estudiante: req.params.id,
        id_semestre: a.id_semestre,
        id_asignatura: a.id_asignatura,
        id_tipoestu,
      }));
      console.log(data)
      await EstudianteSemestre.bulkCreate(data as any);
      res.status(201).json({ msg: 'Asignaturas asignadas correctamente' });
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });
  // Estudiante AUTENTICADO.
  estR.get('/', auth, async (req, res) => {
    const est = await Estudiante.findOne({
      where: { id_usuario: req.user!.id_usuario },
      include: [{ model: Carrera }],
    });
    if (!est) {
      res.status(404).json({ msg: 'No encontrado' });
      return;
    }
    res.json(est);
  });
  estR.post('/', async (req, res) => {
    try {
      const est = await Estudiante.create(req.body);
      res.status(201).json(est);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });
  estR.put('/:id', async (req, res) => {
    try {
      await Estudiante.update(req.body, { where: { id_estudiante: req.params.id } });
      res.json({ msg: 'Estudiante actualizado' });
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });
  app.use('/api/estudiante', estR);
}
