import express from 'express';
import { prisma } from '../lib/prisma';
import { RolUsuario } from '../generated/prisma/client';

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
