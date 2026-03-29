# Épica 2 — Issues #11 y #12: Añadir Habitaciones + Código de Invitación

## Qué se hizo

- Nuevo enum `TipoHabitacion` en el schema (`DORMITORIO`, `BANO`, `COCINA`, `SALON`, `OTRO`)
- Campos añadidos al modelo `Habitacion`: `tipo`, `es_habitable`, `metros_cuadrados`
- `codigo_invitacion` pasa a ser opcional (`String?`): las zonas comunes no tienen código
- Utilidad `generarCodigoInvitacion()` genera códigos únicos con formato `ROOM-XXXX` y reintenta si hay colisión
- Controlador `crearHabitacion`: verifica que la vivienda pertenece al casero logueado (403 si no), genera código solo si `es_habitable: true`
- Ruta `POST /api/viviendas/:id/habitaciones` protegida con `verificarToken`

## Archivos creados / modificados

| Acción | Archivo |
|---|---|
| Modificado | `prisma/schema.prisma` — enum TipoHabitacion + campos Habitacion |
| Nuevo | `src/utils/generarCodigo.ts` |
| Modificado | `src/controllers/vivienda.controller.ts` — añade crearHabitacion |
| Modificado | `src/routes/vivienda.routes.ts` — añade POST /:id/habitaciones |
| Modificado | `docs/backend/api.md` — sección habitaciones |

## Lógica de negocio clave

| Condición | Resultado |
|---|---|
| `es_habitable: true` (o no enviado) | Se genera `codigo_invitacion: "ROOM-XXXX"` |
| `es_habitable: false` | `codigo_invitacion: null` |
| La vivienda no pertenece al casero logueado | `403 Forbidden` |
| No se envía `nombre` | `400 Bad Request` |

## Nota de base de datos

Ejecutar `npx prisma db push` con `npx prisma dev` activo para sincronizar el schema con la BD.
