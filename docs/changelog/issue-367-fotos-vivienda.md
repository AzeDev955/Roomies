# Issue 367 - Fotos de vivienda con Backblaze

## Objetivo

Se integra una galeria propia de fotos por vivienda, almacenada con referencias portables en Backblaze B2 y visible solo para usuarios autorizados.

## Cambios

- Nuevo modelo `FotoVivienda` con provider, key, variante, metadata, orden y marca de portada.
- Nuevos endpoints `GET/POST/PATCH/DELETE /api/viviendas/:id/fotos`.
- Purpose `housing-photo` como media privada compartida con URLs firmadas.
- Nueva pestana de casero para subir, ordenar, marcar portada y borrar fotos de vivienda.
- El inicio del inquilino muestra la galeria de su vivienda con visor ligero.
- Documentacion actualizada en `docs/backend/media-storage.md`.

## Verificacion

- Tests de controlador para permisos, listado autorizado y borrado de fotos.
