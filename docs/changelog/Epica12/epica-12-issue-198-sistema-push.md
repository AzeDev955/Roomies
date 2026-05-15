# Issue #198 - Sistema automatico de cobro por push

**Fecha:** 2026-04-10
**Epica:** 12

## Cambios tecnicos

- `backend/src/services/push.service.ts`: nuevo servicio compartido para validar tokens Expo y enviar notificaciones individuales o por lotes con `expo-server-sdk`.
- `backend/src/services/notification.service.ts`: refactor para reutilizar `push.service.ts` y mantener el envio push existente basado en usuarios.
- `backend/src/controllers/user.controller.ts`: validacion del body y guardado del `expo_push_token` del usuario autenticado.
- `backend/src/routes/user.routes.ts`: nuevo endpoint principal `PATCH /me/push-token` y alias legado `PUT /push-token`.
- `backend/src/cron/recordatorios.cron.ts`: nuevo cron mensual `0 12 5 * *` que se ejecuta el dia 5 a las 12:00, recorre deudas `PENDIENTE` con token registrado y envia el recordatorio de pago al deudor.
- `backend/src/index.ts`: registro de `/api/usuarios` e inicializacion explicita del cron de recordatorios junto al de mensualidades.
- `frontend/utils/notifications.ts`: sincronizacion del Expo Push Token al nuevo endpoint, comprobacion de sesion antes del envio y resolucion del `projectId` desde `EAS`.
- `frontend/app/_layout.tsx`: `useEffect` de arranque para sincronizar el token cuando existe sesion persistida y mantener el handler de foreground activo via import.
- `frontend/app/index.tsx`: sincronizacion push tras login manual y login con Google.
- `frontend/app/registro.tsx`: sincronizacion push tras registro manual y acceso con Google.
- `frontend/app/rol.tsx`: sincronizacion push tras persistir el token cuando un alta nueva confirma el rol.
- `frontend/app.json`: alta del plugin `expo-notifications` para que la configuracion nativa acompane al flujo de push.

## Resultado tecnico observable

- La app solicita permisos push en dispositivo fisico, obtiene el Expo Push Token y lo registra en backend para la sesion autenticada.
- El backend expone `PATCH /api/usuarios/me/push-token` para guardar el token del usuario autenticado.
- El dia 5 de cada mes a las 12:00 se envian recordatorios push a los deudores con pagos pendientes y token Expo disponible.
