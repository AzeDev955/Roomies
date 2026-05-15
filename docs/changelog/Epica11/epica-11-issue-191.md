# Issue #191 — Modelos de inventario y assets

**Fecha:** 2026-04-09
**Épica:** 11

## Cambios técnicos

- `backend/prisma/schema.prisma`: se añadió el enum `EstadoItem` con los valores `NUEVO`, `BUENO`, `DESGASTADO` y `ROTO`.
- `backend/prisma/schema.prisma`: se creó `ItemInventario` con relaciones opcionales a `Habitacion` y `Vivienda`, fecha de registro y colección de `FotoAsset`.
- `backend/prisma/schema.prisma`: se creó `FotoAsset` con URL, relación obligatoria a `ItemInventario` y fecha de subida.
- `backend/prisma/schema.prisma`: se añadieron las relaciones inversas `items_inventario` en `Habitacion` y `Vivienda`.
- `backend/prisma/schema.prisma`: la pertenencia a `Habitacion` o `Vivienda` queda modelada con FKs opcionales para que la validación XOR se aplique desde la capa de backend cuando se implementen los endpoints de inventario.
