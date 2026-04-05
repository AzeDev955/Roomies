# Fix: Simplificación temporal del flujo de acceso — bloqueo SMTP en producción

## Descripción

Los puertos SMTP 465 y 587 están bloqueados en el entorno de Railway, impidiendo el envío de correos de verificación mediante Nodemailer. Como solución temporal se deshabilita la obligatoriedad de verificar el correo para no bloquear el acceso de los usuarios.

## Cambios realizados

### Backend (`backend/src/controllers/auth.controller.ts`)

- `register`:
  - `correo_verificado` cambiado a `true` al crear el usuario (sin esperar verificación de correo).
  - Llamada a `enviarMagicLink` comentada para evitar timeouts en los logs de Railway.
  - Vuelve a devolver `{ token, usuario }` (igual que `login`) para que el registro entre directamente al dashboard.
  - Campo `token_verificacion` eliminado de la creación del usuario (ya no se genera token).

- `login`:
  - Guard `if (!usuario.correo_verificado)` comentado — todos los usuarios pueden entrar.

### Frontend

**`frontend/app/registro.tsx`**
- `handleRegistrar` ahora recibe `{ token, usuario }` del POST /auth/register, guarda el token con `guardarToken` y redirige al dashboard correspondiente según `usuario.rol`.

**`frontend/app/index.tsx`**
- Import de `expo-linking` y `useURL()` comentados.
- `useEffect` que escuchaba `roomies://verificacion?status=success` comentado.

### Backend (`backend/src/services/email.service.ts`)

- `console.log` de diagnóstico de variables de entorno comentados.
- `transporter.verify()` comentado para limpiar la salida de Railway.

## Lo que NO se ha tocado

- `backend/prisma/schema.prisma` — los campos `correo_verificado` y `token_verificacion` permanecen en el modelo para reactivar la verificación cuando se resuelva el acceso SMTP.
- `backend/src/controllers/auth.controller.ts` — `verificarEmail` permanece implementado.
- `backend/src/routes/auth.routes.ts` — ruta `GET /verificar/:token` permanece registrada.
- `frontend/app.json` — `scheme: "roomies"` permanece configurado.

## Cómo reactivar la verificación

1. Descomentar `enviarMagicLink(...)` en `register`.
2. Cambiar `correo_verificado: true` → `false` en `register` y añadir `token_verificacion` al `create`.
3. Descomentar el guard `if (!usuario.correo_verificado)` en `login`.
4. Descomentar `transporter.verify()` y los `console.log` de diagnóstico en `email.service.ts`.
5. Descomentar el import de `Linking` y el `useEffect` en `index.tsx`.
6. En `registro.tsx`, volver a hacer `router.replace('/')` tras el registro en lugar de guardar el token.
