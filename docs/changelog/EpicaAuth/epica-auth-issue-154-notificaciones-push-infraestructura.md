# Feat: Infraestructura base de notificaciones push (Issue #154)

## Descripción

Se implementa la capa de infraestructura completa para enviar y recibir notificaciones push mediante Expo Push Notifications. El sistema permite registrar el token del dispositivo, almacenarlo por usuario en la base de datos y enviar notificaciones desde el backend a uno o varios usuarios.

## Cambios

### Base de datos

**`backend/prisma/schema.prisma`**
- Nuevo campo `expo_push_token String?` en el modelo `Usuario`.

### Backend

**`backend/src/services/notification.service.ts`** _(nuevo)_
- `enviarNotificacionPush(userIds, titulo, cuerpo, data?)`:
  - Consulta los `expo_push_token` de los usuarios indicados.
  - Filtra tokens nulos e inválidos con `Expo.isExpoPushToken`.
  - Divide los mensajes en chunks y los envía con `expo.sendPushNotificationsAsync`.
  - Los errores de tickets individuales se loguean sin abortar el envío del resto.

**`backend/src/controllers/user.controller.ts`** _(nuevo)_
- `actualizarPushToken`: recibe `{ token }` del body y actualiza `expo_push_token` del usuario autenticado. Acepta `null` para borrar el token (p.ej. al hacer logout).

**`backend/src/routes/user.routes.ts`** _(nuevo)_
- `PUT /push-token` — protegida con `verificarToken`.

**`backend/src/index.ts`**
- Registrada la nueva ruta bajo `/api/users`.

**`backend/package.json`**
- Nueva dependencia: `expo-server-sdk ^6.1.0`.

### Frontend

**`frontend/utils/notifications.ts`** _(nuevo)_
- `registerForPushNotificationsAsync()`: comprueba que es dispositivo físico, pide permisos, obtiene el Expo Push Token con el `projectId` de EAS y configura el canal Android.
- `syncPushToken()`: llama a `registerForPushNotificationsAsync` y, si devuelve token, hace `PUT /api/users/push-token`. Los errores se silencian con `console.warn` para no interrumpir el flujo de sesión.
- `Notifications.setNotificationHandler` configurado globalmente para mostrar alertas, sonido y badge incluso con la app en primer plano.

**`frontend/app/index.tsx`**
- `syncPushToken()` llamado (sin await) tras guardar el token en login manual y login Google.

**`frontend/app/registro.tsx`**
- `syncPushToken()` llamado (sin await) tras guardar el token en registro exitoso.

## Decisiones técnicas

- `syncPushToken` se llama sin `await` para no bloquear la navegación al dashboard; los errores de permisos o red no afectan al flujo de autenticación.
- El token se guarda por usuario en BD (no en SecureStore del cliente) para que el backend pueda enviar notificaciones en cualquier momento sin que la app esté abierta.
- `enviarNotificacionPush` acepta un array de `userIds` para soportar broadcasts (p.ej. notificar a todos los inquilinos de una vivienda en una sola llamada).
- El canal Android `default` se crea con `AndroidImportance.MAX` para garantizar que las notificaciones aparezcan como heads-up en Android 8+.
