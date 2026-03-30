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
| `telefono` | string | Sí | Teléfono de contacto |
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
  "telefono": "600123456",
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
    "telefono": "600123456",
    "rol": "CASERO"
  }
}
```

> El token expira en **7 días**. El payload contiene `{ id, rol }`.

---

### GET `/auth/me`

Devuelve los datos del usuario autenticado consultando la base de datos.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Token válido. Devuelve nombre, apellidos, email, rol y teléfono (sin `password_hash`). |
| `401` | No se proporcionó token. |
| `403` | Token inválido o expirado. |
| `404` | Usuario no encontrado en la BD. |

**Ejemplo respuesta 200:**
```json
{
  "id": 1,
  "nombre": "Ana",
  "apellidos": "García López",
  "email": "ana@example.com",
  "rol": "CASERO",
  "telefono": "600123456"
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

> Si `es_habitable: true` se genera automáticamente un `codigo_invitacion` con formato `ROOM-XXXXXX` (6 caracteres alfanuméricos).
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
  "codigo_invitacion": "ROOM-AB3X7K"
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

---

## Inquilino (`/inquilino`)

### POST `/inquilino/unirse`

Permite a un inquilino unirse a una habitación usando su código de invitación.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `codigo_invitacion` | string | Sí | Código `ROOM-XXXXXX` de la habitación |

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Unión correcta. Devuelve `{ mensaje, habitacion }` con datos de la habitación y su vivienda. |
| `400` | Falta `codigo_invitacion` o la habitación ya está ocupada. |
| `403` | El usuario tiene rol `CASERO`. |
| `404` | El código no corresponde a ninguna habitación. |

**Ejemplo respuesta 200:**
```json
{
  "mensaje": "Te has unido a la habitación correctamente.",
  "habitacion": {
    "id": 1,
    "vivienda_id": 1,
    "inquilino_id": 3,
    "nombre": "Habitación 1",
    "tipo": "DORMITORIO",
    "es_habitable": true,
    "metros_cuadrados": 12.5,
    "codigo_invitacion": "ROOM-X7B9K2",
    "vivienda": {
      "id": 1,
      "casero_id": 1,
      "alias_nombre": "Piso Centro",
      "direccion": "Calle Mayor 10, 3ºB",
      "codigo_postal": "28013",
      "ciudad": "Madrid",
      "provincia": "Madrid"
    }
  }
}
```

---

## Incidencias (`/incidencias`)

> ### Sistema de prioridades por colores
>
> Cada incidencia tiene un campo `prioridad` que clasifica su urgencia:
>
> | Valor | Significado |
> |---|---|
> | `VERDE` | Sugerencia o mejora (valor por defecto) |
> | `AMARILLO` | Fallo no urgente |
> | `ROJO` | Emergencia o rotura grave |

---

### POST `/incidencias`

Crea una nueva incidencia asociada a una vivienda.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Reglas de acceso:**
- `CASERO`: debe ser propietario de la vivienda (`vivienda.casero_id === usuario.id`)
- `INQUILINO`: debe tener una habitación asignada en esa vivienda

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `titulo` | string | Sí | Título breve de la incidencia |
| `descripcion` | string | Sí | Descripción detallada |
| `vivienda_id` | number | Sí | ID de la vivienda afectada |
| `prioridad` | `VERDE` \| `AMARILLO` \| `ROJO` | No | Default: `VERDE` |

**Respuestas:**

| Código | Descripción |
|---|---|
| `201` | Incidencia creada. Devuelve el objeto completo. |
| `400` | Falta `titulo`, `descripcion` o `vivienda_id`, o `prioridad` inválida. |
| `401` | Sin token. |
| `403` | Sin pertenencia a la vivienda. |

**Ejemplo respuesta 201:**
```json
{
  "id": 1,
  "vivienda_id": 1,
  "creador_id": 3,
  "titulo": "Grifo roto en el baño",
  "descripcion": "El grifo del lavabo no cierra bien y gotea constantemente.",
  "estado": "PENDIENTE",
  "prioridad": "ROJO",
  "fecha_creacion": "2026-03-29T10:00:00.000Z"
}
```

---

### GET `/incidencias`

Lista las incidencias accesibles para el usuario logueado.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Filtrado por rol:**
- `CASERO`: ve todas las incidencias de **todas sus viviendas**
- `INQUILINO`: ve solo las incidencias de la vivienda donde tiene habitación asignada; devuelve `[]` si no tiene vivienda asignada

**Respuesta incluye:** datos de `vivienda` y `creador { id, nombre, apellidos }` para renderizado de tarjetas de color en el frontend.

**Ordenación:** `fecha_creacion DESC` (más recientes primero).

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Lista de incidencias. Puede ser `[]`. |
| `401` | Sin token. |

**Ejemplo respuesta 200:**
```json
[
  {
    "id": 1,
    "vivienda_id": 1,
    "creador_id": 3,
    "titulo": "Grifo roto en el baño",
    "descripcion": "El grifo del lavabo no cierra bien y gotea constantemente.",
    "estado": "PENDIENTE",
    "prioridad": "ROJO",
    "fecha_creacion": "2026-03-29T10:00:00.000Z",
    "vivienda": {
      "id": 1,
      "casero_id": 1,
      "alias_nombre": "Piso Centro",
      "direccion": "Calle Mayor 10, 3ºB",
      "codigo_postal": "28013",
      "ciudad": "Madrid",
      "provincia": "Madrid"
    },
    "creador": {
      "id": 3,
      "nombre": "Carlos",
      "apellidos": "Martínez López"
    }
  }
]
```

---

### PATCH `/incidencias/:id/estado`

Actualiza el estado de una incidencia.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Reglas de acceso:**
- `CASERO`: debe ser propietario de la vivienda de la incidencia
- `INQUILINO`: debe tener una habitación asignada en la vivienda de la incidencia

**Params:**

| Param | Descripción |
|---|---|
| `id` | ID de la incidencia |

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `estado` | `PENDIENTE` \| `EN_PROCESO` \| `RESUELTA` | Sí | Nuevo estado |

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Estado actualizado. Devuelve la incidencia completa. |
| `400` | `estado` ausente o valor inválido. |
| `401` | Sin token. |
| `403` | Sin pertenencia a la vivienda de la incidencia. |
| `404` | Incidencia no encontrada. |

**Ejemplo respuesta 200:**
```json
{
  "id": 1,
  "vivienda_id": 1,
  "creador_id": 3,
  "titulo": "Grifo roto en el baño",
  "descripcion": "El grifo del lavabo no cierra bien y gotea constantemente.",
  "estado": "EN_PROCESO",
  "prioridad": "ROJO",
  "fecha_creacion": "2026-03-29T10:00:00.000Z"
}
```
