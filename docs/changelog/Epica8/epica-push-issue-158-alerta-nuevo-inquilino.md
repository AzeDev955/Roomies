---
issue: 158
title: Push notification al casero cuando un inquilino se une a una habitación
date: 2026-04-06
---

## Qué se hizo

Cuando un inquilino canjea un código de invitación y se une a una habitación, el casero propietario de esa vivienda recibe una notificación push al instante.

## Cambios

### `backend/src/controllers/inquilino.controller.ts`

- Importa `enviarNotificacionPush` desde `notification.service`.
- En `unirseHabitacion`, el `prisma.habitacion.update` ahora incluye también `inquilino: { select: { nombre, apellidos } }` para obtener el nombre completo del nuevo inquilino.
- Tras enviar la respuesta HTTP 200, lanza `enviarNotificacionPush` en modo fire-and-forget (`catch(console.error)`) con:
  - **Destinatario**: `casero_id` de la vivienda (ya disponible en `habitacionActualizada.vivienda`).
  - **Título**: `👋 Nuevo inquilino`
  - **Cuerpo**: `[Nombre Apellidos] se ha unido a una de tus habitaciones.`

## Notas

- La notificación es fire-and-forget: un fallo en el envío no afecta la respuesta al inquilino.
- El casero recibe la alerta solo si tiene un `expo_push_token` registrado.
