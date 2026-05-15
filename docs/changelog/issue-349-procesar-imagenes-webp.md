# Issue #349 - Procesar imagenes a WebP y generar variantes

## Objetivo

Preparar el backend para procesar imagenes antes de subirlas a Backblaze B2, evitando servir originales pesados y dejando variantes predecibles para los futuros flujos de media.

## Cambios principales

- `backend/src/services/media-image.processor.ts`: nuevo procesador de imagenes con validacion de tipos `jpg/jpeg`, `png` y `webp`, limite de tamano configurable, conversion a WebP y variantes `thumb`, `medium` y `large`.
- `backend/src/services/media.types.ts`: ampliados los tipos de variante y errores controlados con `MEDIA_FILE_TOO_LARGE`.
- `backend/tests/media-image.processor.test.ts`: cobertura del procesado correcto, no escalado de imagenes pequenas, conservacion explicita del original y errores controlados por tipo o tamano.
- `.env.example`, `backend/.env.example` y `docs/backend/media-storage.md`: documentadas `MEDIA_IMAGE_MAX_SIZE_BYTES`, `MEDIA_IMAGE_WEBP_QUALITY` y `MEDIA_IMAGE_KEEP_ORIGINAL`.

## Verificacion

- `npm test -- media-image.processor.test.ts`
