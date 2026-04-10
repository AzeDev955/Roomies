# Épica 2 — Issue #10: Endpoint para Listar Viviendas del Casero (GET /api/viviendas)

## Qué se hizo

- Controlador `listarViviendas`: devuelve todas las viviendas del casero logueado
- Consulta con `include: { habitaciones: true }` para que el frontend reciba las habitaciones en la misma respuesta, evitando una segunda llamada
- Ruta `GET /api/viviendas` protegida con `verificarToken`

## Archivos modificados

| Acción | Archivo |
|---|---|
| Modificado | `src/controllers/vivienda.controller.ts` — añade listarViviendas |
| Modificado | `src/routes/vivienda.routes.ts` — añade GET / |
| Modificado | `docs/backend/api.md` — sección GET /viviendas |

## Decisión: include habitaciones

Se incluyen las habitaciones en la respuesta del listado porque el caso de uso principal del casero es ver su piso junto con sus habitaciones. Evita un endpoint extra y reduce la latencia del frontend.
