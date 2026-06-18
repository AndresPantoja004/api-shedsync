import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Reserva } from '../models';
import { sequelize } from '../db';
import { hayConflictoHorario } from '../clients/horarios.client';
import * as events from '../events';

const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

// POST /api/espacio/reservar  (auth)
export async function reservar(req: Request, res: Response): Promise<void> {
  try {
    const { id_espacio, hora_inicio, hora_fin } = req.body ?? {};
    const id_usuario = req.user?.id_usuario ?? null;
    const fecha = new Date(req.body.fecha);

    if (hora_inicio >= hora_fin) {
      res.status(400).json({ error: 'Rango de horas inválido' });
      return;
    }

    // Conflicto con horario fijo (servicio horarios).
    const conflictoFijo = await hayConflictoHorario({
      id_espacio,
      dia: dias[fecha.getUTCDay()] as string,
      hora_inicio,
      hora_fin,
    });
    if (conflictoFijo) {
      res.status(400).json({ error: 'Conflicto con horario fijo' });
      return;
    }

    // Conflicto de reserva local (no cancelada y solapada).
    const solapada = await Reserva.findOne({
      where: {
        id_espacio,
        fecha,
        estado: { [Op.ne]: 'CANCELADA' },
        hora_inicio: { [Op.lt]: hora_fin },
        hora_fin: { [Op.gt]: hora_inicio },
      } as any,
    });
    if (solapada) {
      res.status(400).json({ error: 'Ya existe una reserva en ese rango' });
      return;
    }

    const reserva = await Reserva.create({
      id_espacio,
      fecha,
      hora_inicio,
      hora_fin,
      estado: 'PENDIENTE',
      id_usuario,
    } as any);

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
    console.error('Error al reservar:', error);
    res.status(500).json({ error: (error as Error).message });
  }
}

// PATCH /api/espacio/reservar/:id/estado  (auth, onlyAdmin)
export async function updateEstadoReserva(req: Request, res: Response): Promise<void> {
  const t = await sequelize.transaction();
  try {
    const { estado } = req.body ?? {};
    const estadosValidos = ['APROBADA', 'CANCELADA'];

    if (!estadosValidos.includes(estado)) {
      await t.rollback();
      res.status(400).json({ msg: 'Estado inválido. Solo se permite APROBADA o CANCELADA' });
      return;
    }

    const reserva = await Reserva.findByPk(req.params.id, { transaction: t });
    if (!reserva) {
      await t.rollback();
      res.status(404).json({ msg: 'Reserva no encontrada' });
      return;
    }

    if (reserva.estado !== 'PENDIENTE') {
      await t.rollback();
      res.status(400).json({ msg: 'Solo se pueden modificar reservas en estado PENDIENTE' });
      return;
    }

    if (estado === 'APROBADA') {
      const conflicto = await Reserva.findOne({
        where: {
          id_espacio: reserva.id_espacio,
          fecha: reserva.fecha,
          estado: 'APROBADA',
          hora_inicio: { [Op.lt]: reserva.hora_fin },
          hora_fin: { [Op.gt]: reserva.hora_inicio },
        } as any,
        transaction: t,
      });
      if (conflicto) {
        await t.rollback();
        res.status(409).json({ msg: 'Conflicto de horario. Ya existe una reserva aprobada en ese rango.' });
        return;
      }
      reserva.fecha_aprobacion = new Date();
      reserva.aprobado_por = req.user?.id_usuario ?? null;
    }

    reserva.estado = estado;
    await reserva.save({ transaction: t });
    await t.commit();

    await events.publish('reserva.estado_actualizada', {
      id_reserva: reserva.id_reserva,
      estado: reserva.estado,
    });

    res.json({ msg: `Reserva ${estado} correctamente`, reserva });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: (error as Error).message });
  }
}

// GET /api/espacio/reservar/pendientes  (auth, onlyAdmin)
export async function getPendientes(_req: Request, res: Response): Promise<void> {
  try {
    const reservas = await Reserva.findAll({
      where: { estado: 'PENDIENTE' },
      order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']],
    });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
