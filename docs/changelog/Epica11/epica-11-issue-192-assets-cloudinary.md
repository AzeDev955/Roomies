# Issue #192 — Infraestructura de assets con Cloudinary

**Fecha:** 2026-04-09
**Épica:** 11

## Cambios técnicos

- `backend/package.json`: se añadieron `cloudinary`, `multer`, `multer-storage-cloudinary` y `@types/multer` para soportar la subida de imágenes del inventario.
- `backend/prisma/schema.prisma`: se incorporaron los modelos `ItemInventario` y `FotoAsset` junto con sus relaciones, como dependencia técnica del endpoint de fotos.
- `backend/src/config/cloudinary.config.ts`: se configuró Cloudinary con variables de entorno y un storage de Multer que sube imágenes a la carpeta `roomies-inventario`.
- `backend/src/controllers/inventario.controller.ts`: se añadió el flujo de subida que valida acceso al item, obtiene la `secure_url` de Cloudinary y crea el registro `FotoAsset`.
- `backend/src/routes/inventario.routes.ts`: se creó `POST /inventario/:itemId/fotos` protegido con token y preparado para recibir un único archivo en el campo `foto`.
- `backend/src/index.ts`: se registró el nuevo router de inventario en `/api/inventario`.
- `backend/.env.example`: se añadieron las variables `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` para documentar la configuración necesaria en local y Railway.
- `CONTEXT.md`, `docs/backend/setup.md` y `docs/backend/api.md`: se actualizó el contexto operativo del proyecto para reflejar el despliegue del backend en Railway con `backend/Dockerfile`, las variables de Cloudinary y el nuevo endpoint de subida.
- `docs/backend/inventario-assets.md`: se añadió una guía breve específica del flujo de assets de inventario en Cloudinary.
