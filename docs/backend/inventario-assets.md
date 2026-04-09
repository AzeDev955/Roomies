# Inventario Assets y Flujo de Alta

## Resumen

El módulo de inventario permite crear `ItemInventario` por vivienda o por habitación y subir después sus fotos a Cloudinary como `FotoAsset`.

## Variables necesarias

Configurar en `backend/.env` o en Railway:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
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
4. Sube la imagen a Cloudinary en la carpeta `roomies-inventario`.
5. Crea un `FotoAsset` con la `secure_url` resultante.

## Respuesta esperada al subir foto

```json
{
  "id": 14,
  "url": "https://res.cloudinary.com/.../roomies-inventario/item.jpg",
  "item_id": 3,
  "fecha_subida": "2026-04-09T21:15:00.000Z"
}
```
