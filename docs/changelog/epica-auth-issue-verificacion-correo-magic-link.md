# Feature: Verificación de correo mediante Magic Link (Deep Linking)

## Descripción

Los nuevos usuarios registrados deben verificar su correo antes de poder iniciar sesión. Al registrarse, reciben un correo HTML con un botón que apunta a un endpoint del backend; éste verifica el token, marca el correo como verificado y redirige a la app mediante un custom scheme (`roomies://`). El login devuelve `403` si el correo no ha sido verificado.

## Cambios realizados

### Backend

**`backend/prisma/schema.prisma`**
- Nuevos campos en modelo `Usuario`:
  - `correo_verificado Boolean @default(false)`
  - `token_verificacion String?`

**`backend/src/services/email.service.ts`** (reescrito)
- Función `enviarMagicLink(email, nombre, token)`: envía correo HTML con botón "Verificar mi cuenta" apuntando a `${BACKEND_URL}/api/auth/verificar/${token}`.
- `BACKEND_URL` leído de `process.env.BACKEND_URL` (fallback `http://localhost:3001`).
- Transporte nodemailer con `service: 'gmail'`, credenciales desde `EMAIL_USER` / `EMAIL_PASS`.

**`backend/src/controllers/auth.controller.ts`**
- `register`:
  - Genera `token_verificacion = crypto.randomBytes(32).toString('hex')`.
  - Crea usuario con `correo_verificado: false` y el token.
  - Llama `enviarMagicLink` de forma asíncrona (`.catch` para no bloquear).
  - Responde `201 { mensaje }` en lugar del JWT — el usuario debe verificar primero.
- `verificarEmail` (nueva):
  - `GET /auth/verificar/:token` — busca usuario por `token_verificacion`.
  - Si no existe → `200` con HTML de error.
  - Si existe → actualiza `correo_verificado: true`, `token_verificacion: null` → `302` a `roomies://verificacion?status=success`.
- `login`:
  - Si `!usuario.correo_verificado` → `403 { error: 'Debes verificar tu correo antes de iniciar sesión.' }`.
- `loginConGoogle`:
  - Crea/actualiza usuarios Google con `correo_verificado: true` (Google ya verificó el email).

**`backend/src/routes/auth.routes.ts`**
- Nueva ruta: `GET /verificar/:token` → `verificarEmail`.

### Frontend

**`frontend/app.json`**
- `"scheme"` cambiado de `"frontend"` a `"roomies"`. El SO intercepta `roomies://` y abre la app.

**`frontend/app/index.tsx`**
- Importa `* as Linking from 'expo-linking'`.
- `Linking.useURL()` escucha la URL de apertura y los eventos de deep link.
- Si `path === 'verificacion' && queryParams.status === 'success'` → `Alert.alert('¡Éxito!', ...)`.

### Documentación

**`CONTEXT.md`**
- Tabla `Usuario`: nuevos campos `correo_verificado` y `token_verificacion`.
- Tabla API `/auth`: nueva fila `GET /auth/verificar/:token`; fila de register y login actualizadas.

**`docs/backend/api.md`**
- `POST /auth/register`: comportamiento y ejemplo de respuesta `201` actualizados.
- Nueva sección `GET /auth/verificar/:token` con comportamiento, respuestas y nota de redirect.
- `POST /auth/login`: nuevo código `403` documentado.

**`docs/frontend/setup.md`**
- Nueva sección "Deep Linking — Custom Scheme `roomies://`" con snippet de `Linking.useURL()`.
- Tabla de decisiones de arquitectura: dos nuevas entradas (deep link + Google OAuth verificado).

## Variables de entorno nuevas

```env
# backend/.env
EMAIL_USER=tu-cuenta@gmail.com
EMAIL_PASS=contraseña-de-aplicacion-gmail
BACKEND_URL=http://<HOST_IP>:3001   # o URL pública de Railway
```

> `EMAIL_PASS` debe ser una **contraseña de aplicación** de Google (no la contraseña normal de Gmail). Generarla en: Cuenta Google → Seguridad → Verificación en dos pasos → Contraseñas de aplicación.

## Decisiones técnicas

- El envío de correo es asíncrono (`.catch` en lugar de `await`) para que un fallo del servidor SMTP no rompa el registro del usuario.
- La ruta de verificación devuelve `200` con HTML (no `404`) cuando el token no existe, para dar feedback amigable en el navegador del móvil.
- Los usuarios de Google se marcan automáticamente como `correo_verificado: true` porque Google ya verifica el email en su flujo OAuth.
- El deep link se captura en `index.tsx` (pantalla de login) con `Linking.useURL()` para que el alert aparezca justo cuando el usuario vuelve a la app tras verificar.
- No se añade caducidad de token en esta iteración — se puede añadir un campo `token_expira DateTime?` en una iteración futura.
