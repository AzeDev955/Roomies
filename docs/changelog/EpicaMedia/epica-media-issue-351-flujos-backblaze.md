# Issue #351 - Flujos de subida en Backblaze

## Objetivo

Migrar las subidas reales de media para que dejen de depender de Cloudinary y usen el contrato interno de media con Backblaze B2.

## Cambios principales

- `backend/src/config/media-upload.config.ts`: nuevo `multer` en memoria para fotos y documentos, con limites y validacion por MIME antes de subir al proveedor interno.
- `backend/src/services/media-upload.service.ts`: centraliza la subida de documentos y el procesado/subida de imagenes WebP, conservando compatibilidad con referencias legacy ya subidas.
- `backend/src/services/media-url.service.ts`: refresca URLs firmadas para referencias privadas Backblaze antes de responder a la app.
- `backend/src/routes/*.routes.ts`: inventario, deudas, gastos y contratos usan el uploader interno en lugar de `multer-storage-cloudinary`.
- `backend/src/controllers/*`: los flujos de inventario, facturas, justificantes, cobros y contratos guardan referencias Backblaze portables; facturas, justificantes y contratos se suben con visibilidad privada y devuelven URL firmada.
- `backend/src/services/backblaze-b2-media.provider.ts`: permite respetar keys, variante y dimensiones calculadas por el procesador de imagenes.

## Verificacion

- `npm test -- media-image.processor.test.ts media-upload.service.test.ts economico.test.ts inventario-issue-277.test.ts`
- `npm run build`
