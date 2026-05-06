import express from 'express';
import {
  generarBufferCsvExcel,
  obtenerDossierFiscalVivienda,
  obtenerFotoOcupacionFiscalVivienda,
  obtenerResumenFiscalAnualVivienda,
} from '../services/fiscal.service';

const obtenerParamNumerico = (valor: string | string[] | undefined) => {
  const normalizado = Array.isArray(valor) ? valor[0] : valor;
  if (!normalizado) return NaN;
  return parseInt(normalizado, 10);
};

export const obtenerOcupacionFiscalVivienda: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const ejercicio = obtenerParamNumerico(req.query.ejercicio as string | string[] | undefined);
  const usuario = req.usuario!;

  if (usuario.rol !== 'CASERO') {
    res.status(403).json({ error: 'Solo el casero puede consultar la ocupacion fiscal.' });
    return;
  }

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId invalido.' });
    return;
  }

  if (!Number.isInteger(ejercicio) || ejercicio < 2000 || ejercicio > 2100) {
    res.status(400).json({ error: 'ejercicio debe ser un ano natural valido.' });
    return;
  }

  const foto = await obtenerFotoOcupacionFiscalVivienda(viviendaId, usuario.id, ejercicio);

  if (!foto) {
    res.status(404).json({ error: 'Vivienda no encontrada.' });
    return;
  }

  res.status(200).json(foto);
};

export const obtenerResumenFiscalVivienda: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const ejercicio = obtenerParamNumerico(req.params.ejercicio);
  const usuario = req.usuario!;

  if (usuario.rol !== 'CASERO') {
    res.status(403).json({ error: 'Solo el casero propietario puede consultar el resumen fiscal.' });
    return;
  }

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId invalido.' });
    return;
  }

  if (!Number.isInteger(ejercicio) || ejercicio < 2000 || ejercicio > 2100) {
    res.status(400).json({ error: 'ejercicio debe ser un ano natural valido.' });
    return;
  }

  const resumen = await obtenerResumenFiscalAnualVivienda(viviendaId, usuario.id, ejercicio);

  if (!resumen) {
    res.status(404).json({ error: 'Vivienda no encontrada.' });
    return;
  }

  res.status(200).json(resumen);
};

export const exportarDossierFiscalVivienda: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const ejercicio = obtenerParamNumerico(req.params.ejercicio);
  const usuario = req.usuario!;

  if (usuario.rol !== 'CASERO') {
    res.status(403).json({ error: 'Solo el casero propietario puede exportar el dossier fiscal.' });
    return;
  }

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId invalido.' });
    return;
  }

  if (!Number.isInteger(ejercicio) || ejercicio < 2000 || ejercicio > 2100) {
    res.status(400).json({ error: 'ejercicio debe ser un ano natural valido.' });
    return;
  }

  const dossier = await obtenerDossierFiscalVivienda(viviendaId, usuario.id, ejercicio);

  if (!dossier) {
    res.status(404).json({ error: 'Vivienda no encontrada.' });
    return;
  }

  if (req.query['formato'] === 'base64') {
    res.status(200).json({
      nombreArchivo: dossier.nombreArchivo,
      mimeType: dossier.mimeType,
      columnas: dossier.columnas,
      contenidoBase64: generarBufferCsvExcel(dossier.contenido).toString('base64'),
    });
    return;
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${dossier.nombreArchivo}"`);
  res.status(200).send(dossier.contenido);
};
