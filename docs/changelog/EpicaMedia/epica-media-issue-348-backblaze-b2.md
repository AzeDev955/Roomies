# Issue #348 - Proveedor Backblaze B2 compatible S3

Se incorpora un proveedor Backblaze B2 S3-compatible para el contrato interno de media definido en la issue #347.

## Cambios principales

- `backend/src/services/backblaze-b2-media.provider.ts`: anade `BackblazeB2MediaStorageProvider` con subida, borrado, URL publica, URL firmada y lectura de metadata.
- `backend/src/config/backblaze.config.ts`: centraliza endpoint, region, bucket, credenciales, TTL de URL firmada, cache control y base URL publica/CDN.
- `backend/src/services/media.service.ts`: permite crear el proveedor interno mediante `MEDIA_PROVIDER=backblaze`.
- `.env.example` y `docs/backend/media-storage.md`: documentan variables necesarias para Backblaze B2.
- `backend/tests/backblaze-b2-media.provider.test.ts`: cubre subida, borrado, firma, metadata y traduccion de errores con cliente S3 simulado.

## Notas

- No se conecta contra un bucket real en tests para evitar depender de credenciales o datos externos.
- Las credenciales se leen solo desde entorno y no se incluyen en logs ni respuestas.
