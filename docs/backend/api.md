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

---

## Viviendas (`/viviendas`)

### GET `/viviendas`

Devuelve todas las viviendas del casero logueado, incluyendo sus habitaciones.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Array de viviendas (puede ser vacío). Cada vivienda incluye `habitaciones[]`. |
| `401` | Sin token. |

**Ejemplo respuesta 200:**
```json
[
  {
    "id": 1,
    "casero_id": 1,
    "alias_nombre": "Piso Centro",
    "direccion": "Calle Mayor 10, 3ºB",
    "codigo_postal": "28013",
    "ciudad": "Madrid",
    "provincia": "Madrid",
    "habitaciones": [
      {
        "id": 1,
        "vivienda_id": 1,
        "inquilino_id": null,
        "nombre": "Habitación 1",
        "tipo": "DORMITORIO",
        "es_habitable": true,
        "metros_cuadrados": 12.5,
        "codigo_invitacion": "ROOM-AB3X"
      }
    ]
  }
]
```

---

### POST `/viviendas`

Crea una nueva vivienda. Solo accesible para usuarios con rol `CASERO`.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `alias_nombre` | string | Sí | Nombre identificativo de la vivienda |
| `direccion` | string | Sí | Dirección completa |
| `codigo_postal` | string | Sí | Código postal |
| `ciudad` | string | Sí | Ciudad |
| `provincia` | string | Sí | Provincia |

**Respuestas:**

| Código | Descripción |
|---|---|
| `201` | Vivienda creada. Devuelve el objeto completo de la vivienda. |
| `400` | Falta alguno de los campos obligatorios. |
| `401` | Sin token. |
| `403` | El usuario tiene rol `INQUILINO`. |

**Ejemplo respuesta 201:**
```json
{
  "id": 1,
  "casero_id": 1,
  "alias_nombre": "Piso Centro",
  "direccion": "Calle Mayor 10, 3ºB",
  "codigo_postal": "28013",
  "ciudad": "Madrid",
  "provincia": "Madrid"
}
```

---

### POST `/viviendas/:id/habitaciones`

Añade una habitación a una vivienda. Solo el casero propietario de la vivienda puede añadir habitaciones.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripción |
|---|---|
| `id` | ID de la vivienda |

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `nombre` | string | Sí | Nombre descriptivo de la habitación |
| `tipo` | `DORMITORIO` \| `BANO` \| `COCINA` \| `SALON` \| `OTRO` | No | Default: `DORMITORIO` |
| `es_habitable` | boolean | No | Si es habitable por un inquilino. Default: `true` |
| `metros_cuadrados` | number | No | Superficie en m² |

**Respuestas:**

| Código | Descripción |
|---|---|
| `201` | Habitación creada. Devuelve el objeto completo. |
| `400` | Falta `nombre`. |
| `401` | Sin token. |
| `403` | La vivienda no pertenece al casero logueado. |

> Si `es_habitable: true` se genera automáticamente un `codigo_invitacion` con formato `ROOM-XXXX`.
> Si `es_habitable: false` (zona común), `codigo_invitacion` es `null`.

**Ejemplo respuesta 201 (dormitorio):**
```json
{
  "id": 1,
  "vivienda_id": 1,
  "inquilino_id": null,
  "nombre": "Habitación 1",
  "tipo": "DORMITORIO",
  "es_habitable": true,
  "metros_cuadrados": 12.5,
  "codigo_invitacion": "ROOM-AB3X"
}
```

**Ejemplo respuesta 201 (zona común):**
```json
{
  "id": 2,
  "vivienda_id": 1,
  "inquilino_id": null,
  "nombre": "Cocina",
  "tipo": "COCINA",
  "es_habitable": false,
  "metros_cuadrados": null,
  "codigo_invitacion": null
}
```
