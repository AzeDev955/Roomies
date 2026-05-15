# Épica 3 — Endpoint POST /api/inquilino/unirse

## Qué se hizo

- Controlador `unirseHabitacion` en `src/controllers/inquilino.controller.ts`
- Ruta `POST /api/inquilino/unirse` protegida con `verificarToken`
- Validaciones en cascada:
  1. Rol `INQUILINO` requerido (403 si es `CASERO`)
  2. `codigo_invitacion` obligatorio en el body (400 si falta)
  3. Habitación existente con ese código (404 si no existe)
  4. Habitación libre — `inquilino_id === null` (400 si ya está ocupada)
- Actualización con `include: { vivienda: true }` para devolver los datos completos de la vivienda al inquilino

## Archivos creados / modificados

| Acción | Archivo |
|---|---|
| Nuevo | `src/controllers/inquilino.controller.ts` |
| Nuevo | `src/routes/inquilino.routes.ts` |
| Modificado | `src/index.ts` — monta `/api/inquilino` |
| Modificado | `docs/backend/api.md` — sección inquilino |

## Respuestas del endpoint

| Código | Condición |
|---|---|
| `200` | Unión correcta. Devuelve `{ mensaje, habitacion: { ...campos, vivienda: { ... } } }` |
| `400` | Falta `codigo_invitacion` o habitación ya ocupada |
| `403` | Usuario con rol `CASERO` |
| `404` | Código no existe en la BD |
