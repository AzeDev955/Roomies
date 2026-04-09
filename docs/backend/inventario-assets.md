# Inventario Assets — Cloudinary

## Resumen

El backend sube las fotos de inventario a Cloudinary y guarda en base de datos la `secure_url` devuelta como registro `FotoAsset`.

## Variables necesarias

Configurar en `backend/.env` o en Railway:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## Endpoint

Ruta:

```http
POST /api/inventario/:itemId/fotos
```

Requisitos:

- Auth con `Bearer token`
- `multipart/form-data`
- Archivo en el campo `foto`

## Comportamiento

1. El backend valida que el `itemId` exista.
2. Resuelve la vivienda del item a partir de `vivienda_id` o de la vivienda de su habitación.
3. Comprueba que el usuario autenticado tenga acceso a esa vivienda.
4. Sube la imagen a Cloudinary en la carpeta `roomies-inventario`.
5. Crea un `FotoAsset` con la URL resultante.

## Respuesta esperada

```json
{
  "id": 14,
  "url": "https://res.cloudinary.com/.../roomies-inventario/item.jpg",
  "item_id": 3,
  "fecha_subida": "2026-04-09T21:15:00.000Z"
}
```
