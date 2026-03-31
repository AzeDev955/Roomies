# Épica 5 — Issue #77: Autenticación social con Google

## Qué se hizo

- Integración de Google OAuth2 con flujo seguro: el móvil obtiene un `idToken` de Google → lo envía al backend → el backend lo verifica con `google-auth-library` (librería oficial de Google) → emite el JWT propio de la app
- Nuevo handler `loginConGoogle` en el backend con verificación via `OAuth2Client.verifyIdToken()`
- Lógica de upsert: si el usuario no existe, se crea con rol `INQUILINO` por defecto; si existe por email pero sin `google_id`, se vincula la cuenta
- Fix en el handler `login`: guard para cuentas que solo tienen Google (`password_hash` null) — devuelve 401 con mensaje explicativo
- Schema actualizado: `password_hash`, `dni`, `apellidos`, `telefono` se vuelven opcionales (`String?`); nuevo campo `google_id String? @unique`
- Botón "Continuar con Google" añadido en `app/index.tsx` (Login) y `app/registro.tsx`, con separador "o" entre ambas formas de acceso
- Estilos del botón Google en `styles/index.styles.ts` y `styles/registro.styles.ts` (fondo blanco, borde gris, icono AntDesign "google" rojo)

## Archivos modificados / creados

| Acción | Archivo |
|---|---|
| Modificado | `backend/prisma/schema.prisma` |
| Pendiente ejecución | Migración Prisma `add-google-oauth` (requiere Docker) |
| Instalado | `google-auth-library` (backend) |
| Modificado | `backend/src/controllers/auth.controller.ts` |
| Modificado | `backend/src/routes/auth.routes.ts` |
| Modificado | `backend/.env` |
| Instalado | `expo-auth-session`, `expo-crypto` (frontend) |
| Modificado | `frontend/app/index.tsx` |
| Modificado | `frontend/app/registro.tsx` |
| Modificado | `frontend/styles/index.styles.ts` |
| Modificado | `frontend/styles/registro.styles.ts` |
| Modificado | `frontend/.env` |
| Modificado | `docs/backend/api.md` |

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| Verificación del `idToken` en el backend con `google-auth-library` | El frontend nunca debe ser quien decida si un token de Google es válido — solo el servidor con la librería oficial de Google puede hacer esa verificación de forma segura |
| `google-auth-library` como librería de verificación | Es la librería oficial de Google para Node.js; evita reimplementar la verificación de JWTs de Google (firma, audience, expiración) |
| `rol: INQUILINO` por defecto para usuarios de Google | La mayoría de usuarios que se registran con Google en una app de pisos compartidos son inquilinos; el casero puede cambiar su rol desde el perfil si fuera necesario en el futuro |
| Upsert por `google_id` OR `email` | Permite vincular cuentas preexistentes (registradas con email/password) a Google sin duplicar usuario — si alguien ya tenía cuenta con ese email, simplemente se añade el `google_id` |
| `password_hash`, `dni`, `apellidos`, `telefono` como `String?` | Google no provee estos datos; hacerlos opcionales en el schema es la solución arquitectónicamente correcta. La validación de negocio (campos requeridos) se mantiene en el controller de registro con formulario |
| `WebBrowser.maybeCompleteAuthSession()` a nivel de módulo | Necesario para que `expo-auth-session` pueda cerrar el navegador embebido cuando Google redirija de vuelta a la app |
| Icono `AntDesign "google"` (ya instalado) | Evita instalar librerías adicionales de SVG o imágenes; el color rojo `#DB4437` es el color oficial de Google |

## Configuración requerida por el usuario

Para activar el login con Google hay que configurar credenciales en Google Cloud Console:

1. Ir a [https://console.cloud.google.com](https://console.cloud.google.com)
2. Crear o seleccionar un proyecto
3. Habilitar la **Google Identity API** (APIs & Services → Library)
4. Crear credenciales OAuth 2.0 (APIs & Services → Credentials):
   - **Web**: añadir como URI de redirección autorizada: `https://auth.expo.io/@<tu-usuario-expo>/frontend`
   - **Android** (para APK nativo): package name del APK
   - **iOS** (para IPA nativo): bundle ID
5. Copiar los Client IDs en los archivos de entorno:
   - `backend/.env` → `GOOGLE_CLIENT_ID=<web_client_id>`
   - `frontend/.env` → `EXPO_PUBLIC_GOOGLE_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

## Cuando levantes Docker

```bash
cd backend && npx prisma migrate dev --name add-google-oauth
```

> Si hay usuarios existentes con `apellidos`, `dni` o `telefono` no nulos, la migración funcionará sin problemas (solo afloja las restricciones NOT NULL). Si la migración falla por otro motivo, usa `npx prisma migrate reset`.
