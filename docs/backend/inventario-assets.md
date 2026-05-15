# Inventario Assets y Flujo de Alta

## Resumen

El módulo de inventario permite crear `ItemInventario` por vivienda o por habitación y subir después sus fotos a Backblaze B2 como `FotoAsset`.

## Variables necesarias

Configurar en `backend/.env` o en Railway:

```env
MEDIA_PROVIDER=backblaze
B2_ENDPOINT=https://s3.<region>.backblazeb2.com
B2_REGION=<region>
B2_BUCKET_NAME=roomies-media
B2_APPLICATION_KEY_ID=tu_key_id
B2_APPLICATION_KEY=tu_application_key
```

## Endpoints

```http
POST /api/viviendas/:viviendaId/inventario
GET /api/viviendas/:viviendaId/inventario
POST /api/inventario/:itemId/fotos
```

## Contrato de creación

Para crear un item el backend espera JSON con:

- `nombre`
- `descripcion` opcional
- `estado` (`NUEVO`, `BUENO`, `DESGASTADO`, `ROTO`)
- exactamente uno entre `habitacion_id` o `vivienda_id`

Reglas:

- solo el casero propietario puede crear items
- `habitacion_id` y `vivienda_id` no pueden viajar juntos
- `vivienda_id` debe coincidir con la vivienda de la ruta
- si se usa `habitacion_id`, esa habitación debe pertenecer a la vivienda

## Flujo recomendado desde frontend

1. Crear el item con `POST /api/viviendas/:viviendaId/inventario`.
2. Si el usuario eligió una imagen, llamar inmediatamente a `POST /api/inventario/:itemId/fotos`.
3. Refrescar el listado con `GET /api/viviendas/:viviendaId/inventario`.

## Comportamiento de subida

1. El backend valida que el `itemId` exista.
2. Resuelve la vivienda del item a partir de `vivienda_id` o de la vivienda de su habitación.
3. Comprueba que el usuario autenticado tenga acceso a esa vivienda.
4. Procesa la imagen a WebP y sube las variantes a Backblaze B2.
5. Crea un `FotoAsset` con `provider`, `key`, metadatos tecnicos y URL firmada de respuesta.

## Respuesta esperada al subir foto

```json
{
  "id": 14,
  "url": "https://s3.<region>.backblazeb2.com/...",
  "item_id": 3,
  "fecha_subida": "2026-04-09T21:15:00.000Z"
}
```
## Update 2026-04-09 - Conformidad del inquilino

- El inventario listado por `GET /api/viviendas/:viviendaId/inventario` incluye el flag `revisado_por_inquilino`.
- El inquilino puede validar un item con `PATCH /api/inventario/:itemId/conformidad`.
- El endpoint no recibe body y marca `revisado_por_inquilino = true`.
- El flujo de discrepancia no sube fotos aqui: redirige al modulo de incidencias para que el inquilino adjunte sus propias evidencias.
