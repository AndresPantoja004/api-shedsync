import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { config } from '../config';
import { Reserva } from '../models';
import * as events from '../events';

// Pregunta a espacios si el id existe (validación síncrona cross-context).
async function espacioExiste(id_espacio: number): Promise<boolean> {
  try {
    const r = await fetch(`${config.espaciosUrl}/api/espacio/${id_espacio}/exists`);
    if (!r.ok) return false;
    const body = (await r.json()) as { exists?: boolean };
    return !!body.exists;
  } catch {
    return false;
  }
}

export async function crearReserva(req: Request, res: Response): Promise<void> {
  try {
    const { id_espacio, fecha, hora_inicio, hora_fin } = req.body ?? {};

    if (!id_espacio || !fecha || !hora_inicio || !hora_fin) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }

    // 1) El espacio debe existir en el contexto espacios.
    if (!(await espacioExiste(Number(id_espacio)))) {
      res.status(404).json({ error: 'El espacio no existe' });
      return;
    }

    // 2) Cruce de horarios en la BD propia (cualquier reserva no cancelada).
    const solapada = await Reserva.findOne({
      where: {
        id_espacio,
        fecha,
        estado: { [Op.ne]: 'CANCELADA' },
        [Op.or]: [
          { hora_inicio: { [Op.between]: [hora_inicio, hora_fin] } },
          { hora_fin: { [Op.between]: [hora_inicio, hora_fin] } },
          {
            [Op.and]: [
              { hora_inicio: { [Op.lte]: hora_inicio } },
              { hora_fin: { [Op.gte]: hora_fin } },
            ],
          },
        ],
      },
    });

    if (solapada) {
      res.status(409).json({ error: 'El espacio ya está reservado en ese horario' });
      return;
    }

    // 3) Crear la reserva (estado inicial PENDIENTE).
    const reserva = await Reserva.create({ id_espacio, fecha, hora_inicio, hora_fin });

    // 4) Publicar el evento (no bloquea si RabbitMQ no está disponible).
    await events.publish('reserva.creada', {
      id_reserva: reserva.id_reserva,
      id_espacio: reserva.id_espacio,
      fecha: reserva.fecha,
      hora_inicio: reserva.hora_inicio,
      hora_fin: reserva.hora_fin,
      estado: reserva.estado,
    });

    res.status(201).json(reserva);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function cancelarReserva(req: Request, res: Response): Promise<void> {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }

    reserva.estado = 'CANCELADA';
    await reserva.save();

    await events.publish('reserva.cancelada', { id_reserva: reserva.id_reserva });
    res.json({ msg: 'Reserva cancelada correctamente' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
