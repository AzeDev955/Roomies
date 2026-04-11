import express from 'express';
import { prisma } from '../lib/prisma';
import { RolUsuario } from '../generated/prisma/client';

type ModuloVivienda = 'limpieza' | 'gastos' | 'inventario';
type CampoModulo = 'mod_limpieza' | 'mod_gastos' | 'mod_inventario';

const CAMPO_MODULO: Record<ModuloVivienda, CampoModulo> = {
  limpieza: 'mod_limpieza',
  gastos: 'mod_gastos',
  inventario: 'mod_inventario',
};

const obtenerParamNumerico = (valor: string | string[] | undefined) => {
  const normalizado = Array.isArray(valor) ? valor[0] : valor;
  return normalizado ? parseInt(normalizado, 10) : NaN;
};

const resolverViviendaIdDesdeParams: ResolverViviendaId = async (req) => {
  const viviendaId = obtenerParamNumerico(req.params['viviendaId'] ?? req.params['id']);
  return Number.isInteger(viviendaId) && viviendaId > 0 ? viviendaId : null;
};

type ResolverViviendaId = (req: express.Request) => Promise<number | null> | number | null;

export const protegerModuloVivienda = (
  modulo: ModuloVivienda,
  resolverViviendaId: ResolverViviendaId = resolverViviendaIdDesdeParams,
): express.RequestHandler => async (req, res, next) => {
  const viviendaId = await resolverViviendaId(req);

  if (!viviendaId) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  const usuario = req.usuario;
  if (!usuario) {
    res.status(401).json({ error: 'Token no proporcionado.' });
    return;
  }

  const campo = CAMPO_MODULO[modulo];
  const vivienda = await prisma.vivienda.findFirst({
    where: {
      id: viviendaId,
      ...(usuario.rol === RolUsuario.CASERO
        ? { casero_id: usuario.id }
        : { habitaciones: { some: { inquilino_id: usuario.id } } }),
    },
    select: { [campo]: true },
  });

  if (!vivienda) {
    res.status(403).json({ error: 'No tienes acceso a esta vivienda.' });
    return;
  }

  if (!vivienda[campo]) {
    res.status(403).json({ error: `El módulo ${modulo} está desactivado para esta vivienda.` });
    return;
  }

  next();
};

export const resolverViviendaIdDesdeItemInventario: ResolverViviendaId = async (req) => {
  const itemId = obtenerParamNumerico(req.params['itemId']);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return null;
  }

  const item = await prisma.itemInventario.findUnique({
    where: { id: itemId },
    select: {
      vivienda_id: true,
      habitacion: { select: { vivienda_id: true } },
    },
  });

  return item?.vivienda_id ?? item?.habitacion?.vivienda_id ?? null;
};

export const resolverViviendaIdDesdeDeuda: ResolverViviendaId = async (req) => {
  const deudaId = obtenerParamNumerico(req.params['deudaId']);
  if (!Number.isInteger(deudaId) || deudaId <= 0) {
    return null;
  }

  const deuda = await prisma.deuda.findUnique({
    where: { id: deudaId },
    select: {
      gasto: { select: { vivienda_id: true } },
    },
  });

  return deuda?.gasto.vivienda_id ?? null;
};
