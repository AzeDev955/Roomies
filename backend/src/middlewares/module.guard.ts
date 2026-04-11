import express from 'express';
import { prisma } from '../lib/prisma';

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

  const campo = CAMPO_MODULO[modulo];
  const vivienda = await prisma.vivienda.findUnique({
    where: { id: viviendaId },
    select: { [campo]: true },
  });

  if (!vivienda) {
    res.status(404).json({ error: 'Vivienda no encontrada.' });
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
