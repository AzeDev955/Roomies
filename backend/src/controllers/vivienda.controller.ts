import express from 'express';
import { prisma } from '../lib/prisma';
import { RolUsuario, TipoHabitacion } from '../generated/prisma/client';
import { generarCodigoInvitacion } from '../utils/generarCodigo';

export const listarViviendas: express.RequestHandler = async (req, res) => {
  const viviendas = await prisma.vivienda.findMany({
    where: { casero_id: req.usuario!.id },
    include: { habitaciones: true },
  });
  res.status(200).json(viviendas);
};

export const crearVivienda: express.RequestHandler = async (req, res) => {
  if (req.usuario!.rol !== RolUsuario.CASERO) {
    res.status(403).json({ error: 'Solo los caseros pueden crear viviendas.' });
    return;
  }

  const { alias_nombre, direccion, codigo_postal, ciudad, provincia } = req.body as {
    alias_nombre: string;
    direccion: string;
    codigo_postal: string;
    ciudad: string;
    provincia: string;
  };

  if (!alias_nombre || !direccion || !codigo_postal || !ciudad || !provincia) {
    res.status(400).json({ error: 'alias_nombre, direccion, codigo_postal, ciudad y provincia son obligatorios.' });
    return;
  }

  const vivienda = await prisma.vivienda.create({
    data: {
      casero_id: req.usuario!.id,
      alias_nombre,
      direccion,
      codigo_postal,
      ciudad,
      provincia,
    },
  });

  res.status(201).json(vivienda);
};

export const obtenerVivienda: express.RequestHandler = async (req, res) => {
  const id = parseInt(req.params['id'] as string, 10);
  const vivienda = await prisma.vivienda.findUnique({
    where: { id },
    include: { habitaciones: true },
  });
  if (!vivienda || vivienda.casero_id !== req.usuario!.id) {
    res.status(404).json({ error: 'Vivienda no encontrada.' });
    return;
  }
  res.status(200).json(vivienda);
};

export const crearHabitacion: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);

  const { nombre, tipo, es_habitable, metros_cuadrados } = req.body as {
    nombre: string;
    tipo?: TipoHabitacion;
    es_habitable?: boolean;
    metros_cuadrados?: number;
  };

  if (!nombre) {
    res.status(400).json({ error: 'nombre es obligatorio.' });
    return;
  }

  const vivienda = await prisma.vivienda.findUnique({ where: { id: viviendaId } });
  if (!vivienda || vivienda.casero_id !== req.usuario!.id) {
    res.status(403).json({ error: 'No tienes permiso para añadir habitaciones a esta vivienda.' });
    return;
  }

  const habitable = es_habitable !== false;
  const codigo_invitacion = habitable ? await generarCodigoInvitacion() : null;

  const habitacion = await prisma.habitacion.create({
    data: {
      vivienda_id: viviendaId,
      nombre,
      tipo: tipo ?? TipoHabitacion.DORMITORIO,
      es_habitable: habitable,
      metros_cuadrados: metros_cuadrados ?? null,
      codigo_invitacion,
    },
  });

  res.status(201).json(habitacion);
};
