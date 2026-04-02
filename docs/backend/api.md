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
> Si la cuenta fue creada solo con Google (sin contraseña), devuelve `401` con el mensaje "Esta cuenta usa Google para iniciar sesión."

---

### POST `/auth/google`

Verifica un `idToken` de Google, crea o vincula el usuario, y devuelve el JWT de la app.

**Auth requerida:** No

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `idToken` | string | Sí | JWT de identidad emitido por Google |

**Comportamiento:**
- Si no existe ningún usuario con ese `google_id` ni ese `email` → crea uno nuevo con rol `INQUILINO` por defecto
- Si ya existe un usuario con el mismo `email` pero sin `google_id` → vincula la cuenta (añade `google_id`)
- Si ya existe con ese `google_id` → login directo

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Token válido. Devuelve JWT de la app + datos del usuario. |
| `400` | Falta `idToken` en el body. |
| `401` | `idToken` inválido o no verificable por Google. |

**Ejemplo respuesta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 3,
    "nombre": "Ana",
    "apellidos": "García",
    "email": "ana@gmail.com",
    "google_id": "107...",
    "telefono": null,
    "rol": "INQUILINO"
  }
}
```

> **Configuración requerida:** Debes crear credenciales OAuth 2.0 en [Google Cloud Console](https://console.cloud.google.com):
> 1. Habilitar la **Google Identity API**
> 2. Crear credencial tipo **Web** (para backend + Expo Go) — añadir como URI autorizada: `https://auth.expo.io/@<tu-usuario-expo>/frontend`
> 3. Crear credenciales tipo **Android** e **iOS** para builds nativos
> 4. Añadir los Client IDs en `backend/.env` (`GOOGLE_CLIENT_ID`) y `frontend/.env` (`EXPO_PUBLIC_GOOGLE_CLIENT_ID`, etc.)

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
| `habitaciones` | array | No | Array de habitaciones a crear junto con la vivienda (ver estructura abajo) |

**Estructura de cada elemento en `habitaciones`:**

| Campo | Tipo | Requerido |
|---|---|---|
| `nombre` | string | Sí |
| `tipo` | `DORMITORIO` \| `BANO` \| `COCINA` \| `SALON` \| `OTRO` | No (default `DORMITORIO`) |
| `es_habitable` | boolean | No (default `true`) |
| `metros_cuadrados` | number | No |

> Las habitaciones se crean en la misma transacción (nested create de Prisma). Si falla una habitación, toda la operación se revierte.

**Respuestas:**

| Código | Descripción |
|---|---|
| `201` | Vivienda creada. Devuelve el objeto completo con `habitaciones[]`. |
| `400` | Falta alguno de los campos obligatorios. |
| `401` | Sin token. |
| `403` | El usuario tiene rol `INQUILINO`. |

---

### GET `/viviendas/:id`

Devuelve el detalle de una vivienda con sus habitaciones e inquilinos asignados.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripción |
|---|---|
| `id` | ID de la vivienda |

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Vivienda con `habitaciones[]` cada una con `inquilino { id, nombre, apellidos, email }` o `null`. |
| `401` | Sin token. |
| `403` | La vivienda no pertenece al casero logueado. |
| `404` | Vivienda no encontrada. |

**Ejemplo respuesta 200:**
```json
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
      "nombre": "Habitación 1",
      "tipo": "DORMITORIO",
      "es_habitable": true,
      "metros_cuadrados": 12.5,
      "codigo_invitacion": "ROOM-AB3X7K",
      "inquilino": {
        "id": 3,
        "nombre": "Carlos",
        "apellidos": "Martínez López",
        "email": "carlos@example.com"
      }
    },
    {
      "id": 2,
      "nombre": "Baño",
      "tipo": "BANO",
      "es_habitable": false,
      "metros_cuadrados": null,
      "codigo_invitacion": null,
      "inquilino": null
    }
  ]
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

### PUT `/viviendas/:id/habitaciones/:habId`

Edita una habitación existente. Solo el casero propietario de la vivienda puede editar habitaciones.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripción |
|---|---|
| `id` | ID de la vivienda |
| `habId` | ID de la habitación |

**Body (JSON):** Mismos campos que en la creación (`nombre`, `tipo`, `es_habitable`, `metros_cuadrados`), todos opcionales.

**Comportamiento del `codigo_invitacion` al editar:**
- `es_habitable` cambia `false → true` → se genera un nuevo código
- `es_habitable` cambia `true → false` → el código se anula (`null`)
- `es_habitable` no cambia → el código existente se conserva

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Habitación actualizada. Devuelve el objeto completo. |
| `401` | Sin token. |
| `403` | La vivienda no pertenece al casero logueado. |
| `404` | Habitación no encontrada en esa vivienda. |

---

### DELETE `/viviendas/:id/habitaciones/:habId`

Elimina una habitación. Solo el casero propietario puede eliminar habitaciones.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripción |
|---|---|
| `id` | ID de la vivienda |
| `habId` | ID de la habitación |

**Respuestas:**

| Código | Descripción |
|---|---|
| `204` | Habitación eliminada correctamente. Sin body. |
| `400` | La habitación tiene un inquilino asignado — no se puede eliminar. |
| `401` | Sin token. |
| `403` | La vivienda no pertenece al casero logueado. |
| `404` | Habitación no encontrada. |

---

### DELETE `/viviendas/:id/habitaciones/:habId/inquilino`

El casero expulsa al inquilino de una habitación. Pone `inquilino_id` a `null` sin eliminar la habitación.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripción |
|---|---|
| `id` | ID de la vivienda |
| `habId` | ID de la habitación |

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Inquilino desvinculado. Devuelve la habitación actualizada. |
| `400` | La habitación no tiene inquilino. |
| `401` | Sin token. |
| `403` | La vivienda no pertenece al casero logueado. |
| `404` | Habitación no encontrada. |

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

### GET `/inquilino/vivienda`

Devuelve la vivienda completa del inquilino logueado, incluyendo todas las habitaciones y sus ocupantes.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Vivienda con `habitaciones[]` completas e inquilinos por habitación. |
| `403` | El usuario tiene rol `CASERO`. |
| `404` | El inquilino no tiene ninguna habitación asignada. |

**Ejemplo respuesta 200:**
```json
{
  "miHabitacionId": 3,
  "vivienda": {
    "id": 1,
    "alias_nombre": "Piso Centro",
    "habitaciones": [
      {
        "id": 2,
        "nombre": "Habitación A",
        "tipo": "DORMITORIO",
        "inquilino": { "id": 5, "nombre": "Ana", "apellidos": "García" }
      },
      {
        "id": 3,
        "nombre": "Habitación B",
        "tipo": "DORMITORIO",
        "inquilino": null
      },
      {
        "id": 4,
        "nombre": "Baño",
        "tipo": "BANO",
        "inquilino": null
      }
    ]
  }
}
```

---

### DELETE `/inquilino/habitacion`

El inquilino abandona su habitación actual.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Abandonado correctamente. Devuelve `{ mensaje }`. |
| `403` | El usuario tiene rol `CASERO`. |
| `404` | El inquilino no tiene ninguna habitación asignada. |

---

### GET `/inquilino/:id/perfil`

Devuelve el perfil de contacto de un inquilino. Solo accesible para el casero cuya vivienda aloja a ese inquilino.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripción |
|---|---|
| `id` | ID del usuario inquilino |

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Perfil del inquilino con su habitación y vivienda. |
| `400` | ID no es un número válido. |
| `401` | Sin token. |
| `403` | El inquilino no vive en ninguna vivienda del casero autenticado. |

**Ejemplo respuesta 200:**
```json
{
  "id": 5,
  "nombre": "Carlos",
  "apellidos": "Martínez López",
  "email": "carlos@example.com",
  "telefono": "+34 600 123 456",
  "habitacion": { "id": 3, "nombre": "Habitación 1" },
  "vivienda": { "id": 1, "alias_nombre": "Piso Centro" }
}
```

> La autorización se implementa en la propia query Prisma: busca una habitación donde `inquilino_id = :id` AND `vivienda.casero_id = req.usuario.id`. Si no existe → 403. `telefono` puede ser `null` si el usuario se registró solo con Google.

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
| `habitacion_id` | number | No | ID de la habitación específica donde ocurre la incidencia |

> **Regla para inquilinos con `habitacion_id`:** si el ID apunta a un dormitorio que no le pertenece → `403`. Los inquilinos solo pueden reportar incidencias en zonas comunes o en su propia habitación.

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

### GET `/incidencias/:id`

Devuelve el detalle completo de una incidencia.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Incidencia con `creador { id, nombre, apellidos }` y `habitacion { id, nombre }` si aplica. |
| `401` | Sin token. |
| `403` | El usuario no tiene acceso a la vivienda de la incidencia. |
| `404` | Incidencia no encontrada. |

---

### PUT `/incidencias/:id`

Edita el título y/o descripción de una incidencia. Solo el creador o el casero de la vivienda pueden editarla.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `titulo` | string | No | Nuevo título |
| `descripcion` | string | No | Nueva descripción |

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Incidencia actualizada. |
| `401` | Sin token. |
| `403` | Sin permiso de edición. |
| `404` | Incidencia no encontrada. |

---

### DELETE `/incidencias/:id`

Elimina una incidencia. Solo el creador o el casero de la vivienda pueden eliminarla.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Respuestas:**

| Código | Descripción |
|---|---|
| `204` | Eliminada correctamente. Sin body. |
| `401` | Sin token. |
| `403` | Sin permiso de eliminación. |
| `404` | Incidencia no encontrada. |

---

### PATCH `/incidencias/:id/estado`

Actualiza el estado de una incidencia.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Reglas de acceso:**
- `CASERO`: debe ser propietario de la vivienda de la incidencia. Sin restricciones adicionales.
- `INQUILINO`: debe tener habitación asignada en la vivienda **y** cumplir al menos una de estas condiciones:
  - Es el creador original de la incidencia
  - La incidencia está vinculada a su propio dormitorio
  - La incidencia está vinculada a una zona común (habitación de tipo distinto a `DORMITORIO`)

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

---

## Anuncios (`/anuncios`)

Tablón de anuncios por vivienda. Todos los miembros de la vivienda (casero e inquilinos) pueden publicar y leer anuncios. Solo el autor o el casero de la vivienda puede eliminarlos.

---

### GET `/anuncios?viviendaId=X`

Lista todos los anuncios de una vivienda, ordenados del más reciente al más antiguo.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Query params:**

| Param | Tipo | Requerido | Descripción |
|---|---|---|---|
| `viviendaId` | number | Sí | ID de la vivienda |

**Reglas de acceso:**
- `CASERO`: debe ser propietario de la vivienda (`vivienda.casero_id === usuario.id`)
- `INQUILINO`: debe tener una habitación asignada en esa vivienda

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Array de anuncios (puede ser `[]`). Cada anuncio incluye `autor { id, nombre }`. |
| `400` | Falta el parámetro `viviendaId`. |
| `401` | Sin token. |
| `403` | El usuario no pertenece a esa vivienda. |

**Ejemplo respuesta 200:**
```json
[
  {
    "id": 2,
    "vivienda_id": 1,
    "autor_id": 3,
    "titulo": "Limpieza del baño esta semana",
    "contenido": "Recordad que toca limpiar el baño compartido el jueves.",
    "fecha_creacion": "2026-04-01T09:00:00.000Z",
    "autor": { "id": 3, "nombre": "Carlos" }
  },
  {
    "id": 1,
    "vivienda_id": 1,
    "autor_id": 1,
    "titulo": "Nueva norma de silencio",
    "contenido": "A partir de ahora silencio a partir de las 23:00.",
    "fecha_creacion": "2026-03-28T18:00:00.000Z",
    "autor": { "id": 1, "nombre": "Ana" }
  }
]
```

---

### POST `/anuncios`

Publica un nuevo anuncio en una vivienda.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Reglas de acceso:** Igual que GET — casero propietario o inquilino de la vivienda.

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `titulo` | string | Sí | Título del anuncio |
| `contenido` | string | Sí | Cuerpo del anuncio |
| `vivienda_id` | number | Sí | ID de la vivienda |

**Respuestas:**

| Código | Descripción |
|---|---|
| `201` | Anuncio creado. Devuelve el objeto completo con `autor { id, nombre }`. |
| `400` | Falta alguno de los campos obligatorios. |
| `401` | Sin token. |
| `403` | El usuario no pertenece a esa vivienda. |

**Ejemplo respuesta 201:**
```json
{
  "id": 3,
  "vivienda_id": 1,
  "autor_id": 3,
  "titulo": "Busco compañero para compra",
  "contenido": "¿Alguien se apunta al Mercadona el sábado?",
  "fecha_creacion": "2026-04-01T10:30:00.000Z",
  "autor": { "id": 3, "nombre": "Carlos" }
}
```

---

### DELETE `/anuncios/:id`

Elimina un anuncio.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripción |
|---|---|
| `id` | ID del anuncio |

**Reglas de acceso:** Solo puede eliminar el **autor** del anuncio (`anuncio.autor_id === usuario.id`) **o** el **casero** de la vivienda donde está publicado.

**Respuestas:**

| Código | Descripción |
|---|---|
| `204` | Anuncio eliminado correctamente. Sin body. |
| `401` | Sin token. |
| `403` | El usuario no es el autor ni el casero de la vivienda. |
| `404` | Anuncio no encontrado. |
