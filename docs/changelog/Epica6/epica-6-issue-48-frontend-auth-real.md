# Épica 6 — Issue #48: Autenticación real con JWT y expo-secure-store

## Contexto

Inicio de la Épica 6: Integración API y Datos Reales. El primer paso es reemplazar el login placeholder por un formulario de autenticación real conectado al backend.

## Cambios realizados

### Backend — Seeder de usuarios de prueba

- **`backend/prisma/seed.ts`** (nuevo): crea un usuario `CASERO` y un `INQUILINO` con contraseñas hasheadas con bcrypt. Usa `upsert` para ser idempotente.
- **`backend/package.json`**: añadida clave `prisma.seed` para poder ejecutar `npx prisma db seed`.

**Credenciales de prueba:**

| Rol | Email | Contraseña |
|---|---|---|
| CASERO | `casero@test.com` | `casero123` |
| INQUILINO | `inquilino@test.com` | `inquilino123` |

### Frontend — Login real

- **`expo-secure-store`** instalado (SDK 54 compatible) para almacenamiento seguro del token JWT.
- **`frontend/services/auth.service.ts`** (nuevo): utilidades `guardarToken`, `obtenerToken` y `eliminarToken` usando `SecureStore`.
- **`frontend/app/index.tsx`**: reescrito. De placeholder a formulario real con campos email/contraseña, estado `loading`, `ActivityIndicator` durante la petición, y redirección por rol (`CASERO` → `/casero/viviendas`, `INQUILINO` → `/inquilino/inicio`).
- **`frontend/styles/index.styles.ts`**: reescrito con estilos del formulario (`logo`, `subtitulo`, `label`, `input`, `botonLogin`, `botonLoginDeshabilitado`, `botonLoginTexto`).

## Arquitectura destacada

- `botonLoginDeshabilitado` es una clase estática separada (no `opacity` inline) — el componente selecciona entre las dos clases según el estado `loading`.
- El token se almacena en `SecureStore` (cifrado por el OS) en lugar de `AsyncStorage`.
- La URL del backend tiene un comentario para indicar cómo cambiarla por la IP de red local al probar en dispositivo físico.
