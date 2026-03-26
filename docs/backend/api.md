# API Reference — Backend Roomies

Base URL: `http://localhost:3000/api`

---

## Autenticación (`/auth`)

### POST `/auth/register`

Registra un nuevo usuario en el sistema.

**Auth requerida:** No

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `nombre` | string | Sí | Nombre del usuario |
| `apellidos` | string | Sí | Apellidos del usuario |
| `dni` | string | Sí | DNI (único en el sistema) |
| `email` | string | Sí | Email (único en el sistema) |
| `password` | string | Sí | Contraseña en texto plano (se hashea con bcrypt) |
| `telefono` | string | No | Teléfono de contacto |
| `rol` | `CASERO` \| `INQUILINO` | Sí | Rol del usuario |

**Respuestas:**

| Código | Descripción |
|---|---|
| `201` | Usuario creado correctamente. Devuelve el objeto usuario sin `password_hash`. |
| `400` | El email o DNI ya está registrado. |

**Ejemplo respuesta 201:**
```json
{
  "id": 1,
  "nombre": "Ana",
  "apellidos": "García López",
  "dni": "12345678A",
  "email": "ana@example.com",
  "telefono": null,
  "rol": "CASERO"
}
```

---

### POST `/auth/login`

Autentica un usuario y devuelve un JWT.

**Auth requerida:** No

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `email` | string | Sí | Email del usuario |
| `password` | string | Sí | Contraseña en texto plano |

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Login correcto. Devuelve token JWT + datos del usuario sin `password_hash`. |
| `401` | Credenciales inválidas (email no existe o contraseña incorrecta). |

**Ejemplo respuesta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Ana",
    "apellidos": "García López",
    "dni": "12345678A",
    "email": "ana@example.com",
    "telefono": null,
    "rol": "CASERO"
  }
}
```

> El token expira en **7 días**. El payload contiene `{ id, rol }`.

---

### GET `/auth/me`

Devuelve el payload del token activo. No consulta la base de datos.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Token válido. Devuelve el payload `{ id, rol }`. |
| `401` | No se proporcionó token. |
| `403` | Token inválido o expirado. |

**Ejemplo respuesta 200:**
```json
{
  "id": 1,
  "rol": "CASERO"
}
```
