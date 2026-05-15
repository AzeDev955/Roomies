# Issue #347 - Auditoria de Cloudinary y contrato interno de media

## Objetivo

Se audita el acoplamiento actual con Cloudinary y se deja definido el contrato tecnico que debera usar Roomies para abstraer subidas, borrados, URLs publicas/firmadas y metadata antes de migrar a Backblaze.

## Cambios

- `backend/src/services/media.types.ts`: anade tipos e interfaz `MediaStorageProvider` con `upload`, `delete`, `getPublicUrl`, `getSignedUrl` y `getMetadata`.
- `docs/backend/media-storage.md`: documenta la matriz de uso actual de Cloudinary por flujo, privacidad de los datos, estructura portable de `MediaObject`, campos actuales y variables propuestas para Backblaze.

## Decision tecnica

Los ficheros financieros, contractuales e inventario se trataran como privados por defecto. Las URLs publicas quedaran reservadas para futuros flujos publicos explicitos, como anuncios o fotos comerciales de vivienda.

## Pendiente

- Implementar un proveedor Cloudinary detras del contrato.
- Anadir provider/key y metadata tecnica a Prisma o centralizar los ficheros en una tabla `MediaAsset`.
- Migrar lecturas privadas a URLs firmadas o proxy protegido.
