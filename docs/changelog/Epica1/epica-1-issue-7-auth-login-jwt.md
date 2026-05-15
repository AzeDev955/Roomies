# Issue #7 — Endpoint POST /auth/login con JWT

**Épica:** 1 — Setup inicial del proyecto
**Fecha:** 2026-03-27
**Rama:** `dev`

## Qué se hizo

- Instalada librería `jsonwebtoken` para generación y firma de tokens JWT.
- Añadida variable de entorno `JWT_SECRET` al `.env`.
- Añadida función `login` en `src/controllers/auth.controller.ts`:
  - Busca el usuario por email (`findUnique`). Si no existe → 401.
  - Compara la contraseña con `bcrypt.compare`. Si no coincide → 401.
  - Genera un JWT firmado con payload `{ id, rol }` y expiración de 7 días.
  - Devuelve 200 con `{ token, usuario }` (sin `password_hash`).
- Añadida ruta `POST /login` en `src/routes/auth.routes.ts`.

## Endpoints disponibles en /api/auth

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro de nuevo usuario |
| POST | `/api/auth/login` | Login → devuelve JWT |

### POST /api/auth/login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Respuestas:**
- `200 OK` — `{ token: "eyJ...", usuario: { id, nombre, ... } }`
- `401 Unauthorized` — `{ error: "Credenciales inválidas." }`

## Notas

- El mismo mensaje de error se usa para usuario no encontrado y contraseña incorrecta (evita enumeración de usuarios).
- El token incluye `id` y `rol` en el payload para su uso futuro en middleware de protección de rutas.
- `JWT_SECRET` debe cambiarse a un valor seguro en producción.
