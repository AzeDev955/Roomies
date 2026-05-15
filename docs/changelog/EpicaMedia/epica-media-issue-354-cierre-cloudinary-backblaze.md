# Issue #354 - Cierre migracion Backblaze y retirada Cloudinary

## Objetivo

Cerrar la epica #346 retirando dependencias, configuracion activa y documentacion operativa del proveedor anterior, dejando Backblaze B2 como unico proveedor de media soportado por el contrato interno.

## Cambios principales

- `backend/package.json` y `backend/package-lock.json`: eliminan las dependencias `cloudinary` y `multer-storage-cloudinary`.
- `backend/src/config/cloudinary.config.ts`: eliminado; las rutas usan `backend/src/config/media-upload.config.ts` con `multer` en memoria.
- `backend/src/services/media.types.ts`, `media-reference.service.ts` y `media-cleanup.service.ts`: restringen proveedores activos a `backblaze` y `external`, con default `backblaze`.
- `backend/prisma/schema.prisma` y `backend/prisma/migrations/20260515143000_default_media_provider_backblaze/migration.sql`: cambian el default de `FotoAsset.provider` a `backblaze`.
- `.env.example`, `backend/.env.example`, `docker-compose.yml`, `README.md`, `CONTEXT.md`, `docs/backend/*` y `docs/infra/setup-despliegue.md`: sustituyen la configuracion operativa por Backblaze B2.
- `backend/prisma/seed.ts` y tests de media/economia/inventario: eliminan expectativas y URLs demo del proveedor retirado.

## Matriz final

| Issue | Archivos principales | Tests/verificacion | Estado |
| --- | --- | --- | --- |
| #347 | `backend/src/services/media.types.ts`, `docs/backend/media-storage.md` | Cubierto por tests de media posteriores | Cerrado |
| #348 | `backend/src/services/backblaze-b2-media.provider.ts`, `backend/src/config/backblaze.config.ts` | `backblaze-b2-media.provider.test.ts` | Cerrado |
| #349 | `backend/src/services/media-image.processor.ts` | `media-image.processor.test.ts` | Cerrado |
| #350 | `backend/src/services/media-reference.service.ts`, `backend/prisma/schema.prisma` | `economico.test.ts`, `operational-modules.test.ts` | Cerrado |
| #351 | `backend/src/services/media-upload.service.ts`, `backend/src/config/media-upload.config.ts`, rutas de gastos/deudas/inventario/contratos | `media-upload.service.test.ts`, `economico.test.ts` | Cerrado |
| #352 | `backend/src/services/media-serving.service.ts`, controladores y servicios fiscales | `media-serving.service.test.ts`, `media-upload.service.test.ts` | Cerrado |
| #353 | `backend/src/services/media-cleanup.service.ts`, controladores de borrado/reemplazo | `media-cleanup.service.test.ts` | Cerrado |
| #354 | Configuracion, dependencias, docs y changelog de cierre | `rg -i "cloudinary"` en superficies activas, build y tests backend | Cerrado |

## Pendientes reales

- Definir CDN/base publica definitiva para futuros objetos `listing-photo`.
- Endurecer politica de URLs firmadas si se exige auditoria avanzada por recurso.
- Automatizar limpieza programada de objetos huerfanos en Backblaze si el volumen lo justifica.
- Preparar migracion legacy solo si aparecen datos reales previos fuera de entornos demo.
