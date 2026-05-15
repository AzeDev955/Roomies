# Issue #350 - Referencias portables de media

## Objetivo

Adaptar los modelos y contratos de backend para conservar referencias de media desacopladas del proveedor sin romper las URLs que consume el frontend.

## Cambios principales

- `backend/prisma/schema.prisma`: gastos, deudas, contratos y fotos de inventario guardan `provider`, `key`, `variant`, `mimeType`, tamano y dimensiones cuando aplica.
- `backend/prisma/migrations/20260515120000_add_portable_media_references/migration.sql`: anade columnas portables y migra datos legacy rellenando `key` desde las URLs existentes.
- `backend/src/services/media-reference.service.ts`: centraliza la conversion de archivos subidos por `multer` a referencias portables.
- Controladores de gastos, deudas, contratos, cobros e inventario: mantienen `*_url` para el frontend y exponen/guardan los nuevos metadatos para borrado o reconstruccion futura.
- `backend/prisma/seed.ts`: conserva justificantes demo como referencias `external` compatibles.

## Verificacion

- `npm run build`
- `npm test -- economico.test.ts operational-modules.test.ts backblaze-b2-media.provider.test.ts media-image.processor.test.ts`
