# Épica 4 — Endpoint POST /api/incidencias

## Qué se hizo

- Controlador `crearIncidencia` en `src/controllers/incidencia.controller.ts`
- Ruta `POST /api/incidencias` protegida con `verificarToken`
- Validaciones en cascada:
  1. Campos obligatorios: `titulo`, `descripcion`, `vivienda_id` (400 si falta alguno)
  2. Autorización según rol:
     - `INQUILINO`: debe tener una habitación asignada en `vivienda_id` (403 si no)
     - `CASERO`: debe ser propietario de `vivienda_id` (403 si no)
- Creación con estado inicial `PENDIENTE` (por defecto en schema)

## Archivos creados / modificados

| Acción | Archivo |
|---|---|
| Nuevo | `src/controllers/incidencia.controller.ts` |
| Nuevo | `src/routes/incidencia.routes.ts` |
| Modificado | `src/index.ts` — monta `/api/incidencias` |

## Respuestas del endpoint

| Código | Condición |
|---|---|
| `201` | Incidencia creada. Devuelve el objeto `Incidencia`. |
| `400` | Falta `titulo`, `descripcion` o `vivienda_id`. |
| `401` | Sin token. |
| `403` | INQUILINO sin habitación en esa vivienda, o CASERO que no es propietario. |

## Ejemplo respuesta 201

```json
{
  "id": 1,
  "vivienda_id": 1,
  "creador_id": 3,
  "titulo": "Grifo roto en el baño",
  "descripcion": "El grifo del lavabo no cierra bien y gotea constantemente.",
  "estado": "PENDIENTE",
  "fecha_creacion": "2026-03-29T10:00:00.000Z"
}
```
