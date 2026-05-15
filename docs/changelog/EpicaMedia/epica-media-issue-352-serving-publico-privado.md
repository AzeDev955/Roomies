# Issue #352 - Serving de media publica y privada

## Objetivo

Definir y aplicar la estrategia inicial para servir media publica, compartida y privada desde Backblaze B2 sin que el frontend construya URLs sensibles ni conozca keys internas.

## Cambios principales

- `backend/src/services/media-serving.service.ts`: nueva matriz por `purpose` para decidir visibilidad de subida, URL publica o URL firmada y TTL por tipo de media.
- `backend/src/services/media-upload.service.ts`: la visibilidad efectiva se deriva del `purpose`; inventario pasa a subirse como privado compartido.
- `backend/src/services/media-reference.service.ts`: las URLs firmadas privadas de Backblaze no se persisten en columnas legacy; se refrescan al responder.
- `backend/src/controllers/*` y `backend/src/services/fiscal.service.ts`: las respuestas resuelven URLs firmadas para facturas, justificantes, contratos, inventario y dossier fiscal, ocultando `provider` y `key` internos cuando llegan al frontend.
- `.env.example`, `backend/.env.example` y `docs/backend/media-storage.md`: documentan TTL diferenciado para media compartida y documentos privados, y la estrategia futura de CDN para `listing-photo`.

## Verificacion

- `npm test -- media-serving.service.test.ts media-upload.service.test.ts backblaze-b2-media.provider.test.ts`
