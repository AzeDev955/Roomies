# Épica 2 — Issue #9: Endpoint para Crear Vivienda (POST /api/viviendas)

## Qué se hizo

- Controlador `crearVivienda` en `src/controllers/vivienda.controller.ts`
- Ruta `POST /api/viviendas` protegida con middleware `verificarToken`
- Validación de rol: solo `CASERO` puede crear viviendas (403 si es `INQUILINO`)
- Validación de campos obligatorios: `alias_nombre` y `direccion` (400 si faltan)
- `casero_id` se asigna automáticamente desde `req.usuario.id`

## Archivos creados / modificados

| Acción | Archivo |
|---|---|
| Nuevo | `src/controllers/vivienda.controller.ts` |
| Nuevo | `src/routes/vivienda.routes.ts` |
| Modificado | `src/index.ts` — monta `/api/viviendas` |
| Nuevo | `docs/backend/api.md` — sección viviendas |

## Respuestas del endpoint

| Código | Condición |
|---|---|
| `201` | Vivienda creada correctamente |
| `400` | Falta `alias_nombre` o `direccion` |
| `401` | Sin token |
| `403` | Usuario con rol `INQUILINO` |
