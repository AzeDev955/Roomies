# Épica 4 — Issue #17 + #18: Endpoints POST y GET /api/incidencias

## Qué se hizo

### Sistema de prioridades por colores (`PrioridadIncidencia`)

Nuevo enum añadido a `prisma/schema.prisma`:

| Valor | Significado |
|---|---|
| `VERDE` | Sugerencia o mejora (por defecto) |
| `AMARILLO` | Fallo no urgente |
| `ROJO` | Emergencia o rotura grave |

El campo `prioridad` se añadió al modelo `Incidencia` con default `VERDE`.

### POST `/api/incidencias` — Crear incidencia

- Controlador `crearIncidencia` en `src/controllers/incidencia.controller.ts`
- Validaciones:
  1. Campos obligatorios: `titulo`, `descripcion`, `vivienda_id` (400 si falta alguno)
  2. `prioridad` opcional; si se envía, debe ser `VERDE`, `AMARILLO` o `ROJO` (400 si es inválido)
  3. `INQUILINO`: debe tener una habitación asignada en `vivienda_id` (403 si no)
  4. `CASERO`: debe ser propietario de `vivienda_id` (403 si no)

### GET `/api/incidencias` — Listar incidencias

- Controlador `listarIncidencias` en `src/controllers/incidencia.controller.ts`
- Filtrado por rol:
  - `CASERO`: ve todas las incidencias de **todas sus viviendas** (`where: { vivienda: { casero_id } }`)
  - `INQUILINO`: ve solo las incidencias de la vivienda donde tiene habitación asignada; si no tiene vivienda, devuelve `[]`
- Incluye `vivienda` y `creador { id, nombre, apellidos }` para que el frontend pueda pintar los círculos de color por casa y mostrar quién reportó
- Ordenadas por `fecha_creacion DESC` (más recientes primero)

## Archivos creados / modificados

| Acción | Archivo |
|---|---|
| Modificado | `prisma/schema.prisma` — enum `PrioridadIncidencia` + campo en `Incidencia` |
| Nuevo | `src/controllers/incidencia.controller.ts` |
| Nuevo | `src/routes/incidencia.routes.ts` |
| Modificado | `src/index.ts` — monta `/api/incidencias` |

## Respuestas

### POST `/api/incidencias`

| Código | Condición |
|---|---|
| `201` | Incidencia creada |
| `400` | Faltan campos o `prioridad` inválida |
| `401` | Sin token |
| `403` | Sin pertenencia a la vivienda |

### GET `/api/incidencias`

| Código | Condición |
|---|---|
| `200` | Lista de incidencias (puede ser `[]`) |
| `401` | Sin token |

## Nota

`npx prisma db push` debe ejecutarse con `npx prisma dev` activo para aplicar el nuevo campo y enum a la base de datos.
