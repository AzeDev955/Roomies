# Épica 4 — Issue #19: Endpoint PATCH /api/incidencias/:id/estado

## Qué se hizo

- Función `actualizarEstadoIncidencia` añadida a `src/controllers/incidencia.controller.ts`
- Ruta `PATCH /api/incidencias/:id/estado` protegida con `verificarToken`
- Sin cambios en el schema (el enum `EstadoIncidencia` ya existía)

## Lógica

1. Parsea `id` del param y `estado` del body
2. Valida que `estado` sea `PENDIENTE`, `EN_PROCESO` o `RESUELTA` — 400 si es inválido
3. Busca la incidencia con `include: { vivienda: true }` — 404 si no existe
4. Autorización por rol:
   - `CASERO`: debe ser propietario de la vivienda de la incidencia (`vivienda.casero_id === usuarioId`)
   - `INQUILINO`: debe tener una habitación asignada en la misma vivienda (`findFirst { vivienda_id, inquilino_id }`)
   - 403 si no cumple ninguna condición
5. Actualiza con `prisma.incidencia.update` y devuelve la incidencia actualizada

## Archivos modificados

| Acción | Archivo |
|---|---|
| Modificado | `src/controllers/incidencia.controller.ts` — añade `actualizarEstadoIncidencia` + import de `EstadoIncidencia` |
| Modificado | `src/routes/incidencia.routes.ts` — añade `PATCH /:id/estado` |

## Respuestas del endpoint

| Código | Condición |
|---|---|
| `200` | Estado actualizado. Devuelve la incidencia completa. |
| `400` | `estado` ausente o valor fuera de enum. |
| `401` | Sin token. |
| `403` | CASERO no propietario, o INQUILINO sin habitación en esa vivienda. |
| `404` | Incidencia no encontrada. |
