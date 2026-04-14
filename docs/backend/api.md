# API Reference — Backend Roomies

Base URL: `http://localhost:3000/api`

En Docker Compose, la API queda publicada en `http://localhost:3001/api`.

---

## Salud (`/`)

### GET `/ping`

Comprueba que el servidor Express esta vivo.

**Auth requerida:** No

**Respuesta `200`:**

```text
pong
```

## Autenticación (`/auth`)

### POST `/auth/register`

Registra un nuevo usuario en el sistema.

**Auth requerida:** No

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `nombre` | string | Sí | Nombre del usuario |
| `apellidos` | string | Sí | Apellidos del usuario |
| `documento_identidad` | string | Sí | DNI, NIE o pasaporte (único en el sistema). Ver reglas de validación abajo. |
| `email` | string | Sí | Email con formato válido (único en el sistema) |
| `password` | string | Sí | Contraseña en texto plano (se hashea con bcrypt). Mínimo 8 caracteres, al menos una mayúscula y un número. |
| `telefono` | string | Sí | Teléfono de contacto |
| `rol` | `CASERO` \| `INQUILINO` | Sí | Rol del usuario |

**Validación del campo `documento_identidad`:**

El campo se valida en el middleware `validate(registroSchema)` (Zod) antes de llegar al controlador:

- Formato general: alfanumérico, entre 6 y 15 caracteres (`/^[A-Z0-9]{6,15}$/i`).
- Si el valor empieza por dígito o por `X`, `Y` o `Z` (formato DNI/NIE español), se aplica adicionalmente el algoritmo del módulo 23:
  - **DNI**: 8 dígitos + letra de control (`TRWAGMYFPDXBNJZSQVHLCKE[n % 23]`).
  - **NIE**: prefijo `X/Y/Z` (→ `0/1/2`) + 7 dígitos + letra de control.
- Cualquier otro string alfanumérico de 6-15 caracteres se acepta como pasaporte internacional.

**Comportamiento:**
1. Crea el usuario con `correo_verificado: false` y un `token_verificacion` aleatorio (hex-32).
2. Envía un correo HTML con un botón "Verificar mi cuenta" apuntando a `GET /auth/verificar/:token`.
3. El envío de correo es asíncrono — no bloquea la respuesta al cliente.
4. **No devuelve JWT**. El usuario debe verificar su correo antes de poder hacer login.

**Respuestas:**

| Código | Descripción |
|---|---|
| `201` | Usuario creado. Devuelve `{ mensaje }` indicando que debe revisar el correo. |
| `400` | Datos inválidos (validación Zod) — devuelve `{ error, errores: [{ campo, mensaje }] }`. |
| `400` | El email o documento de identidad ya está registrado. |

**Ejemplo body:**
```json
{
  "nombre": "Ana",
  "apellidos": "García López",
  "documento_identidad": "12345678Z",
  "email": "ana@example.com",
  "password": "Segura123",
  "telefono": "600123456",
  "rol": "CASERO"
}
```

**Ejemplo respuesta 201:**
```json
{
  "mensaje": "Cuenta creada. Revisa tu correo para verificar tu cuenta antes de iniciar sesión."
}
```

**Ejemplo respuesta 400 (validación Zod):**
```json
{
  "error": "Datos de registro inválidos.",
  "errores": [
    { "campo": "documento_identidad", "mensaje": "El DNI o NIE introducido no es válido" },
    { "campo": "password", "mensaje": "La contraseña debe contener al menos una letra mayúscula" }
  ]
}
```

---

### GET `/auth/verificar/:token`

Verifica el correo de un usuario mediante el magic link recibido por email.

**Auth requerida:** No

**Parámetros de ruta:**

| Parámetro | Descripción |
|---|---|
| `token` | Token hex-32 generado en el registro |

**Comportamiento:**
- Busca al usuario por `token_verificacion`.
- Si no existe o ya fue usado → responde `200` con una página HTML de error.
- Si existe → actualiza `correo_verificado: true` y `token_verificacion: null`, luego redirige al deep link de la app.

**Respuestas:**

| Código | Descripción |
|---|---|
| `302` | Token válido. Redirige a `roomies://verificacion?status=success`. |
| `200` | Token inválido o ya utilizado. Devuelve HTML con mensaje de error. |

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
| `403` | El correo del usuario aún no ha sido verificado. |

**Ejemplo respuesta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Ana",
    "apellidos": "García López",
    "documento_identidad": "12345678Z",
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
    "mod_limpieza": true,
    "mod_gastos": true,
    "mod_inventario": true,
    "habitaciones": [
      {
        "id": 1,
        "vivienda_id": 1,
        "inquilino_id": null,
        "nombre": "Habitación 1",
        "tipo": "DORMITORIO",
        "es_habitable": true,
        "metros_cuadrados": 12.5,
        "precio": 450,
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
| `precio` | number/string/null | No | Precio mensual privado. Solo se guarda si `es_habitable: true`; se limpia a `null` en zonas comunes. |

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
  "mod_limpieza": true,
  "mod_gastos": true,
  "mod_inventario": true,
  "habitaciones": [
    {
      "id": 1,
      "nombre": "Habitación 1",
      "tipo": "DORMITORIO",
      "es_habitable": true,
      "metros_cuadrados": 12.5,
      "precio": 450,
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

### PATCH `/viviendas/:id`

Actualiza la configuracion modular de una vivienda. Solo el casero propietario puede cambiar estos flags.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripcion |
|---|---|
| `id` | ID de la vivienda |

**Body (JSON):** al menos uno de estos campos.

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `mod_limpieza` | boolean | No | Activa o desactiva rutas y tabs del modulo de limpieza |
| `mod_gastos` | boolean | No | Activa o desactiva gastos, deudas, cobros y mensualidades recurrentes |
| `mod_inventario` | boolean | No | Activa o desactiva inventario, fotos y conformidad |

**Respuestas:**

| Codigo | Descripcion |
|---|---|
| `200` | Vivienda actualizada con habitaciones, inquilinos y contadores de incidencias. |
| `400` | ID invalido, body vacio o algun flag no booleano. |
| `403` | El usuario no es casero o la vivienda no le pertenece. |

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
| `precio` | number/string/null | No | Precio mensual privado. Solo se guarda para habitaciones habitables. |

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
  "precio": 450,
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
  "precio": null,
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

**Body (JSON):** Mismos campos que en la creación (`nombre`, `tipo`, `es_habitable`, `metros_cuadrados`, `precio`), todos opcionales.

**Comportamiento del `codigo_invitacion` al editar:**
- `es_habitable` cambia `false → true` → se genera un nuevo código
- `es_habitable` cambia `true → false` → el código se anula (`null`)
- `es_habitable` no cambia → el código existente se conserva
- `precio` se conserva o actualiza solo mientras la habitacion sea habitable; si pasa a zona comun se guarda como `null`.

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

**Privacidad y modulos:**
- La vivienda incluye `mod_limpieza`, `mod_gastos` y `mod_inventario` para adaptar la navegacion del cliente.
- Las habitaciones incluyen `precio`, pero el backend solo conserva el importe en la habitacion asignada al usuario autenticado. El resto se serializa como `precio: null`.

**Ejemplo respuesta 200:**
```json
{
  "miHabitacionId": 3,
  "vivienda": {
    "id": 1,
    "alias_nombre": "Piso Centro",
    "mod_limpieza": true,
    "mod_gastos": true,
    "mod_inventario": true,
    "habitaciones": [
      {
        "id": 2,
        "nombre": "Habitación A",
        "tipo": "DORMITORIO",
        "precio": null,
        "inquilino": { "id": 5, "nombre": "Ana", "apellidos": "García" }
      },
      {
        "id": 3,
        "nombre": "Habitación B",
        "tipo": "DORMITORIO",
        "precio": 450,
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

---

## Gastos y cobros (`/viviendas/:viviendaId`)

Todos los endpoints de esta seccion estan protegidos por `mod_gastos`. Si el modulo esta desactivado en la vivienda, el backend responde `403` con `El modulo gastos esta desactivado para esta vivienda.`.

### GET `/viviendas/:viviendaId/gastos`

Lista los gastos de una vivienda con su pagador y el array de `deudas[]` generado para cada gasto.

**Auth requerida:** Si - `Authorization: Bearer <token>`

**Reglas de acceso:**
- Debes pertenecer a la vivienda (`CASERO` propietario o `INQUILINO` con habitacion asignada).

**Respuestas:**

| Codigo | Descripcion |
|---|---|
| `200` | Array de `Gasto[]` ordenado por `fecha_creacion` descendente. |
| `400` | `viviendaId` invalido. |
| `403` | No perteneces a la vivienda. |

**Campos relevantes por gasto:**
- `pagador { id, nombre, apellidos }`
- `factura_url` cuando existe factura original subida a Cloudinary
- `deudas[]` con `id`, `deudor_id`, `acreedor_id`, `importe`, `estado` y `justificante_url`

---

### POST `/viviendas/:viviendaId/gastos`

Crea un gasto puntual y reparte automaticamente la deuda entre los inquilinos activos de la vivienda. Tambien permite registrar facturas puntuales del casero con adjunto y reparto manual.

**Auth requerida:** Si - `Authorization: Bearer <token>`

**Content-Type:** `application/json` o `multipart/form-data` si se adjunta factura.

**Body:**

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `concepto` | string | Si | Nombre corto del gasto |
| `importe` | number | Si | Importe total, debe ser mayor que `0` |
| `implicadosIds` | number[] | No | IDs concretos a repartir; si se omite se usan todos los inquilinos activos |
| `repartoManual` | `{ usuario_id, importe }[]` o JSON string | No | Reparto desigual por inquilino activo. La suma en centimos debe coincidir con `importe`. |
| `fecha` | string ISO | No | Fecha del gasto/factura. Si se omite se usa `now()`. |
| `factura` | file | No | Imagen o PDF de factura original cuando se usa `multipart/form-data`. |

**Respuestas:**

| Codigo | Descripcion |
|---|---|
| `201` | Gasto creado con sus `deudas[]`. |
| `400` | Faltan datos, `importe <= 0`, fecha invalida, implicados invalidos o `repartoManual` descuadrado. |
| `403` | No perteneces a la vivienda. |

**Notas de reparto manual:**
- Todos los `usuario_id` deben ser inquilinos activos de la vivienda y no pueden repetirse.
- Los importes pueden ser `0`, pero nunca negativos ni invalidos.
- Si el pagador aparece en `repartoManual`, no se genera deuda contra si mismo, pero su importe cuenta para cuadrar el total.
- Si no se envia `repartoManual`, se usa el reparto automatico entre `implicadosIds` o todos los inquilinos activos. El reparto automatico trabaja en centimos y distribuye el resto para que la suma de deudas coincida con el gasto.

---

### PATCH `/viviendas/:viviendaId/gastos/:gastoId`

Edita una factura mensual o gasto ya generado.

**Auth requerida:** Si - `Authorization: Bearer <token>`

**Reglas de acceso:**
- Solo el `CASERO` propietario de la vivienda puede editar facturas de la vivienda.
- `concepto` y `fecha` pueden modificarse aunque existan pagos registrados.
- `importe` solo puede modificarse si ninguna deuda hija esta `PAGADA`.
- Cuando cambia `importe`, el backend recalcula el `importe` de cada `Deuda` hija repartiendo el nuevo total de forma equitativa.

**Body (JSON):**

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `concepto` | string | No | Nuevo concepto, no puede quedar vacio |
| `importe` | number | No | Nuevo importe total, mayor que `0` |
| `fecha` | string | No | Fecha ISO para actualizar `fecha_creacion` |

**Respuestas:**

| Codigo | Descripcion |
|---|---|
| `200` | Gasto actualizado con `pagador` y `deudas[]`. |
| `400` | IDs invalidos, body vacio, campos invalidos o intento de cambiar `importe` con deudas `PAGADA`. |
| `403` | No eres el casero propietario de la vivienda. |
| `404` | Gasto no encontrado en esa vivienda. |

---

### POST `/viviendas/:viviendaId/gastos/:gastoId/factura`

Sube o reemplaza la imagen de factura adjunta a un gasto.

**Auth requerida:** Si - `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Reglas de acceso:**
- Solo el `CASERO` propietario de la vivienda puede subir la foto de la factura.
- Requiere Cloudinary configurado en el servidor.
- El archivo debe ser una imagen (`jpg`, `jpeg`, `png` o `webp`) en el campo `factura`.

**Body multipart:**

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `factura` | file | Si | Imagen de la factura |

**Respuestas:**

| Codigo | Descripcion |
|---|---|
| `201` | Gasto actualizado con `factura_url`, `pagador` y `deudas[]`. |
| `400` | IDs invalidos o falta el archivo `factura`. |
| `403` | No eres el casero propietario de la vivienda. |
| `404` | Gasto no encontrado en esa vivienda. |
| `500` | Cloudinary no esta configurado o no devuelve URL de subida. |

---

### GET `/viviendas/:viviendaId/deudas`

Lista las deudas de la vivienda donde el usuario autenticado participa como deudor o acreedor.

**Auth requerida:** Si - `Authorization: Bearer <token>`

**Respuestas:**

| Codigo | Descripcion |
|---|---|
| `200` | Array de `Deuda[]` ordenado por `id` descendente. |
| `400` | `viviendaId` invalido. |
| `403` | No perteneces a la vivienda. |

**Incluye:**
- `deudor { id, nombre, apellidos }`
- `acreedor { id, nombre, apellidos }`
- `gasto { concepto, factura_url }`

---

### PATCH `/viviendas/:viviendaId/deudas/:deudaId/saldar`

Marca una deuda como `PAGADA`.

**Auth requerida:** Si - `Authorization: Bearer <token>`

**Reglas de acceso:**
- Debes pertenecer a la vivienda.
- Solo el `deudor` de esa deuda puede saldarla.

**Respuestas:**

| Codigo | Descripcion |
|---|---|
| `200` | Deuda actualizada con `estado: "PAGADA"`. |
| `400` | `viviendaId` o `deudaId` invalidos. |
| `403` | No perteneces a la vivienda o no eres el deudor. |
| `404` | Deuda no encontrada en esa vivienda. |
| `409` | La deuda ya estaba saldada. |

---

### GET `/viviendas/:viviendaId/gastos-recurrentes`

Lista las mensualidades configuradas para una vivienda.

**Auth requerida:** Si - `Authorization: Bearer <token>`

**Reglas de acceso:**
- Solo el `CASERO` propietario de la vivienda puede ver sus mensualidades.

**Respuestas:**

| Codigo | Descripcion |
|---|---|
| `200` | Array de `GastoRecurrente[]`, ordenado por `activo`, `dia_del_mes` e `id`. |
| `400` | `viviendaId` invalido. |
| `403` | No eres el casero propietario de la vivienda. |

**Incluye:**
- `pagador { id, nombre, apellidos }`

**Nota automatica:**
- El cron `0 2 * * *` revisa cada dia las mensualidades activas cuyo `dia_del_mes` coincide con la fecha actual y las convierte en `Gasto`. El casero queda como pagador/acreedor y el importe se reparte entre inquilinos activos.

---

### POST `/viviendas/:viviendaId/gastos-recurrentes`

Crea una mensualidad recurrente para la vivienda. Es un flujo de casero; el inquilino no puede crear ni listar gastos recurrentes.

**Auth requerida:** Si - `Authorization: Bearer <token>`

**Body (JSON):**

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `concepto` | string | Si | Nombre de la mensualidad |
| `importe` | number | Si | Importe total, mayor que `0` |
| `dia_del_mes` | number | Si | Entero entre `1` y `31` |

**Respuestas:**

| Codigo | Descripcion |
|---|---|
| `201` | Mensualidad creada. |
| `400` | Datos invalidos o `dia_del_mes` fuera de rango. |
| `403` | No eres el casero propietario de la vivienda. |

---

### GET `/viviendas/:viviendaId/cobros`

Devuelve el dashboard financiero mensual del casero para una vivienda.

**Auth requerida:** Si - `Authorization: Bearer <token>`

**Reglas de acceso:**
- Solo el `CASERO` propietario de la vivienda puede consultar este endpoint.

**Comportamiento:**
- Filtra deudas del mes actual donde el usuario autenticado es el acreedor.
- Calcula `total_pagado_mes`, `total_pendiente` y `total_deudas`.
- Devuelve detalle por deuda con `deudor`, `gasto` (`id`, `concepto`, `importe`, `factura_url`, `fecha_creacion`) y `justificante_url`.

**Respuestas:**

| Codigo | Descripcion |
|---|---|
| `200` | Resumen mensual de cobros de la vivienda. |
| `400` | `viviendaId` invalido. |
| `403` | No tienes acceso a los cobros de esta vivienda. |
| `404` | Vivienda no encontrada. |

**Ejemplo respuesta 200:**
```json
{
  "vivienda": {
    "id": 3,
    "alias_nombre": "Piso Centro",
    "direccion": "Calle Mayor 10, 3B"
  },
  "periodo": {
    "inicio": "2026-04-01T00:00:00.000Z",
    "fin": "2026-05-01T00:00:00.000Z"
  },
  "resumen": {
    "total_pagado_mes": 620,
    "total_pendiente": 310,
    "total_deudas": 5
  },
  "deudas": [
    {
      "id": 14,
      "importe": 310,
      "estado": "PAGADA",
      "justificante_url": "https://res.cloudinary.com/.../roomies-justificantes/deuda-14.jpg",
      "gasto": {
        "id": 8,
        "concepto": "Alquiler abril",
        "importe": 930,
        "factura_url": "https://res.cloudinary.com/.../roomies-facturas/factura-8.jpg",
        "fecha_creacion": "2026-04-01T00:00:00.000Z"
      },
      "deudor": {
        "id": 6,
        "nombre": "Marta",
        "apellidos": "Lopez",
        "avatar": null
      }
    }
  ]
}
```

---

## Deudas (`/deudas`)

### POST `/deudas/:deudaId/justificante`

Sube un justificante de pago a Cloudinary y guarda la `secure_url` en la deuda.

**Auth requerida:** Si - `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Params:**

| Param | Descripcion |
|---|---|
| `deudaId` | ID de la deuda |

**Body multipart:**

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `justificante` | file | Si | Imagen (`jpg`, `jpeg`, `png`, `webp`) |

**Reglas de acceso:**
- Debes pertenecer a la vivienda asociada a la deuda.
- Solo el `deudor` de la deuda puede subir el justificante.

**Respuestas:**

| Codigo | Descripcion |
|---|---|
| `201` | Deuda actualizada con `justificante_url`. |
| `400` | `deudaId` invalido o falta la imagen. |
| `403` | No perteneces a la vivienda o no eres el deudor. |
| `404` | Deuda no encontrada. |
| `500` | Cloudinary no esta configurado o no se pudo obtener la URL subida. |

---

## Usuarios (`/usuarios`)

### PATCH `/usuarios/me/push-token`

Guarda o limpia el `expo_push_token` del usuario autenticado.

**Auth requerida:** Si - `Authorization: Bearer <token>`

**Body (JSON):**

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `token` | string \| null | Si | Token Expo valido, o `null` para eliminarlo |

**Respuestas:**

| Codigo | Descripcion |
|---|---|
| `200` | `{ "mensaje": "Push token actualizado." }` |
| `400` | `token` no es string no vacio ni `null`. |

**Alias legacy disponibles:**
- `PUT /usuarios/push-token`
- `PATCH /users/me/push-token`
- `PUT /users/push-token`

**Nota automatica:**
- El cron `0 12 5 * *` envia recordatorios push de deudas `PENDIENTE` a usuarios con este token registrado.

---

## Inventario (`/inventario`)

Los endpoints de inventario estan protegidos por `mod_inventario`. Si el modulo esta desactivado en la vivienda, el backend responde `403` antes de crear, listar, subir fotos o marcar conformidad.

### POST `/viviendas/:viviendaId/inventario`

Crea un nuevo `ItemInventario` para una vivienda. Pensado para el flujo de configuración del casero.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripción |
|---|---|
| `viviendaId` | ID de la vivienda |

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `nombre` | string | Sí | Nombre del ítem |
| `descripcion` | string | No | Texto libre opcional |
| `estado` | `NUEVO` \| `BUENO` \| `DESGASTADO` \| `ROTO` | No | Default: `BUENO` |
| `habitacion_id` | number | Condicional | Obligatorio si no se envía `vivienda_id` |
| `vivienda_id` | number | Condicional | Obligatorio si no se envía `habitacion_id` |

**Validaciones:**

- Solo el `CASERO` propietario puede crear items.
- Debe llegar exactamente uno de estos campos: `habitacion_id` o `vivienda_id`.
- Si se usa `vivienda_id`, debe coincidir con `:viviendaId`.
- Si se usa `habitacion_id`, esa habitación debe pertenecer a la vivienda.

**Respuestas:**

| Código | Descripción |
|---|---|
| `201` | Item creado con `habitacion` y `fotos[]`. |
| `400` | Datos inválidos, estado incorrecto o violación de la regla XOR entre `habitacion_id` y `vivienda_id`. |
| `403` | El usuario no es el casero propietario de la vivienda. |

**Ejemplo respuesta 201:**
```json
{
  "id": 5,
  "nombre": "Sofá chaise longue",
  "descripcion": "Tapicería beige, lado derecho",
  "estado": "BUENO",
  "habitacion_id": null,
  "vivienda_id": 2,
  "fecha_registro": "2026-04-09T22:30:00.000Z",
  "habitacion": null,
  "fotos": []
}
```

---

### GET `/viviendas/:viviendaId/inventario`

Lista todos los items de inventario de una vivienda, incluyendo habitación asociada si existe y el array de fotos.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Reglas de acceso:**

- `CASERO`: debe ser propietario de la vivienda.
- `INQUILINO`: debe tener habitación asignada en esa vivienda.

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Array de `ItemInventario[]`. Puede ser `[]`. |
| `400` | `viviendaId` inválido. |
| `403` | El usuario no tiene acceso al inventario de esa vivienda. |

**Ejemplo respuesta 200:**
```json
[
  {
    "id": 5,
    "nombre": "Sofá chaise longue",
    "descripcion": "Tapicería beige, lado derecho",
    "estado": "BUENO",
    "habitacion_id": null,
    "vivienda_id": 2,
    "fecha_registro": "2026-04-09T22:30:00.000Z",
    "habitacion": null,
    "fotos": [
      {
        "id": 11,
        "url": "https://res.cloudinary.com/.../roomies-inventario/sofa.jpg",
        "item_id": 5,
        "fecha_subida": "2026-04-09T22:31:00.000Z"
      }
    ]
  }
]
```

---

### POST `/inventario/:itemId/fotos`

Sube una foto de inventario a Cloudinary y crea un `FotoAsset` vinculado al item.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Params:**

| Param | Descripción |
|---|---|
| `itemId` | ID del `ItemInventario` |

**Body multipart:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `foto` | file | Sí | Imagen (`jpg`, `jpeg`, `png`, `webp`) |

**Reglas de acceso:**

- `CASERO`: debe ser propietario de la vivienda a la que pertenece el item.
- `INQUILINO`: debe tener habitación asignada en la vivienda a la que pertenece el item.

**Respuestas:**

| Código | Descripción |
|---|---|
| `201` | Foto subida y asset creado. |
| `400` | `itemId` inválido, falta imagen o el item no tiene vivienda resoluble. |
| `403` | El usuario no tiene permiso sobre el item. |
| `404` | Item de inventario no encontrado. |
| `500` | Cloudinary no está configurado en el servidor o no se obtiene la URL subida. |

**Ejemplo respuesta 201:**
```json
{
  "id": 14,
  "url": "https://res.cloudinary.com/.../roomies-inventario/item.jpg",
  "item_id": 3,
  "fecha_subida": "2026-04-09T21:15:00.000Z"
}
```

---

## Limpieza — `/viviendas/:id/limpieza`

Los endpoints de limpieza estan protegidos por `mod_limpieza`. Si el modulo esta desactivado en la vivienda, el backend responde `403` antes de gestionar zonas, asignaciones o turnos.

Todos los endpoints requieren que el usuario autenticado sea el **casero propietario** de la vivienda.

### POST `/viviendas/:id/limpieza/zonas`

Crea una nueva zona limpiable en la vivienda.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripción |
|---|---|
| `id` | ID de la vivienda |

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `nombre` | string | Sí | Nombre descriptivo (ej. "Cocina", "Baño 1") |
| `peso` | number | Sí | Esfuerzo relativo positivo (ej. `10`) |

**Respuestas:**

| Código | Descripción |
|---|---|
| `201` | Zona creada. Devuelve el objeto `ZonaLimpieza`. |
| `400` | Faltan campos o `peso` no es positivo. |
| `403` | La vivienda no pertenece al casero autenticado. |

**Ejemplo respuesta 201:**
```json
{ "id": 1, "vivienda_id": 3, "nombre": "Cocina", "peso": 10, "activa": true }
```

---

### GET `/viviendas/:id/limpieza/zonas`

Lista todas las zonas de la vivienda, incluyendo sus asignaciones fijas.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Array de zonas con `asignaciones_fijas[]` embebidas. |
| `403` | La vivienda no pertenece al casero autenticado. |

**Ejemplo respuesta 200:**
```json
[
  {
    "id": 1,
    "vivienda_id": 3,
    "nombre": "Cocina",
    "peso": 10,
    "activa": true,
    "asignaciones_fijas": []
  },
  {
    "id": 2,
    "vivienda_id": 3,
    "nombre": "Baño 1",
    "peso": 7,
    "activa": true,
    "asignaciones_fijas": [
      {
        "id": 1,
        "zona_id": 2,
        "usuario_id": 5,
        "usuario": { "id": 5, "nombre": "Ana", "apellidos": "García" }
      }
    ]
  }
]
```

---

### PUT `/viviendas/:id/limpieza/zonas/:zonaId`

Actualiza el nombre, peso o estado activo de una zona.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripción |
|---|---|
| `id` | ID de la vivienda |
| `zonaId` | ID de la zona |

**Body (JSON):** Todos los campos son opcionales.

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | string | Nuevo nombre de la zona |
| `peso` | number | Nuevo peso (debe ser positivo) |
| `activa` | boolean | `false` excluye la zona del reparto |

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Zona actualizada. Devuelve el objeto completo. |
| `400` | `peso` no es positivo. |
| `403` | La vivienda no pertenece al casero autenticado. |
| `404` | Zona no encontrada en esa vivienda. |

---

### POST `/viviendas/:id/limpieza/zonas/:zonaId/asignacion`

Sincroniza la lista de inquilinos fijos de una zona (operación destructiva: reemplaza el conjunto completo). Enviar `usuario_ids: []` equivale a quitar todas las asignaciones.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripción |
|---|---|
| `id` | ID de la vivienda |
| `zonaId` | ID de la zona |

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `usuario_ids` | number[] | Sí | IDs de los inquilinos a asignar (puede ser `[]`) |

**Validaciones:**
- Cada ID debe corresponder a un inquilino con habitación en la vivienda.

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Asignaciones sincronizadas. Devuelve el array `AsignacionLimpiezaFija[]` actualizado, cada una con `usuario { id, nombre, apellidos }` embebido. |
| `400` | `usuario_ids` no es un array. |
| `403` | La vivienda no pertenece al casero, o algún ID no es inquilino de la vivienda. |
| `404` | Zona no encontrada en esa vivienda. |

**Ejemplo respuesta 200:**
```json
[
  { "id": 3, "zona_id": 2, "usuario_id": 5, "usuario": { "id": 5, "nombre": "Ana", "apellidos": "García" } },
  { "id": 4, "zona_id": 2, "usuario_id": 7, "usuario": { "id": 7, "nombre": "Luis", "apellidos": "Pérez" } }
]
```

---

### DELETE `/viviendas/:id/limpieza/zonas/:zonaId/asignacion`

Elimina **todas** las asignaciones fijas de una zona de una vez.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Respuestas:**

| Código | Descripción |
|---|---|
| `204` | Asignaciones eliminadas. Sin body. |
| `403` | La vivienda no pertenece al casero autenticado. |
| `404` | Zona no encontrada, o la zona no tenía asignaciones. |

---

### DELETE `/viviendas/:id/limpieza/zonas/:zonaId`

Elimina una zona y todas sus dependencias (asignaciones fijas y turnos de limpieza).

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Respuestas:**

| Código | Descripción |
|---|---|
| `204` | Zona eliminada. Sin body. |
| `403` | La vivienda no pertenece al casero autenticado. |
| `404` | Zona no encontrada. |

> La operación es atómica (`$transaction`): si falla cualquier paso, no se borra nada.

---

### POST `/viviendas/:id/limpieza/generar`

Ejecuta el algoritmo de reparto y genera los turnos de limpieza para la siguiente semana disponible.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Lógica de fechas (incremental):**
- Si no hay turnos previos o el último es de una semana pasada → genera la semana actual (lunes–domingo).
- Si ya existe algún turno de esta semana o futuro → genera la semana inmediatamente siguiente al último turno encontrado.
- El casero puede pulsar N veces para generar N semanas consecutivas.

**Algoritmo:**
1. **Fase A** — Zonas con asignación fija: de los co-responsables activos, se elige al de menor carga efectiva (`carga_semanal + balance_limpieza`).
2. **Fase B** — Zonas rotativas (sin asignados activos): greedy decreciente por peso, asignado al usuario con menor carga efectiva.
3. **Fase C** — Actualización de karma: `nuevo_balance = balance + (carga_asignada − cuota_ideal)`.

**Respuestas:**

| Código | Descripción |
|---|---|
| `201` | Turnos generados correctamente. |
| `400` | No hay inquilinos activos, no hay zonas activas, u otro error de dominio. |
| `403` | La vivienda no pertenece al casero autenticado. |

**Ejemplo respuesta 201:**
```json
{ "mensaje": "Turnos de limpieza generados correctamente." }
```

---

### GET `/viviendas/:id/limpieza/turnos`

Devuelve los turnos de la semana indicada (o de la semana actual si no se especifica fecha).

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Acceso:** Casero de la vivienda **o** inquilino con habitación en ella.

**Query params:**

| Param | Tipo | Requerido | Descripción |
|---|---|---|---|
| `fecha` | string (`YYYY-MM-DD`) | No | Cualquier día de la semana objetivo. Si se omite, se usa la semana actual. |

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Array de `TurnoLimpieza[]` con `zona` y `usuario` embebidos, ordenados por usuario y peso desc. Puede ser `[]`. |
| `403` | El usuario no pertenece a la vivienda. |

**Ejemplo respuesta 200:**
```json
[
  {
    "id": 12,
    "usuario_id": 5,
    "zona_id": 1,
    "fecha_inicio": "2026-04-07T00:00:00.000Z",
    "fecha_fin": "2026-04-13T23:59:59.999Z",
    "estado": "PENDIENTE",
    "zona": { "id": 1, "nombre": "Cocina", "peso": 10 },
    "usuario": { "id": 5, "nombre": "Ana", "apellidos": "García" }
  }
]
```

---

### GET `/viviendas/:id/limpieza/turnos/export`

Exporta los turnos de limpieza visibles para el usuario autenticado en CSV compatible con Excel.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Acceso:** Casero de la vivienda **o** inquilino con habitación en ella.

**Query params opcionales:**

| Param | Tipo | Descripcion |
|---|---|---|
| `fecha` | `YYYY-MM-DD` | Exporta la semana de esa fecha (lunes a domingo). |
| `fechaDesde` | `YYYY-MM-DD` | Inicio de rango histórico. |
| `fechaHasta` | `YYYY-MM-DD` | Fin de rango histórico. |
| `estado` | `PENDIENTE` \| `HECHO` \| `NO_HECHO` | Filtra por estado. |
| `formato` | `base64` | Devuelve JSON con el archivo codificado en base64 para preservar acentos en móvil. |

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Devuelve `text/csv; charset=utf-8` con `Content-Disposition` de descarga. |
| `200` | Con `formato=base64`, devuelve `{ nombreArchivo, mimeType, contenidoBase64 }`. |
| `400` | Filtros no válidos. |
| `403` | El usuario no pertenece a la vivienda o el módulo está desactivado. |
| `404` | No hay limpiezas para exportar con los filtros actuales. |

**Cabeceras del CSV:**

`Zona a limpiar`, `Inquilino`, `Fecha`.

---

### PATCH `/viviendas/:id/limpieza/turnos/:turnoId/hecho`

Marca un turno como `HECHO`. No tiene body.

**Auth requerida:** Sí — `Authorization: Bearer <token>`

**Params:**

| Param | Descripción |
|---|---|
| `id` | ID de la vivienda |
| `turnoId` | ID del turno |

**Reglas de acceso:** Solo puede marcar el turno el **usuario asignado** (`turno.usuario_id`) o el **casero** de la vivienda.

**Respuestas:**

| Código | Descripción |
|---|---|
| `200` | Turno actualizado. Devuelve el `TurnoLimpieza` con `zona` y `usuario` embebidos. |
| `403` | El usuario no es el asignado ni el casero. |
| `404` | Turno no encontrado en esa vivienda. |
## Update 2026-04-09 - Inventario inquilino

### PATCH `/inventario/:itemId/conformidad`

Marca un `ItemInventario` como revisado por el inquilino.

- Auth: `Bearer token`
- Solo `INQUILINO`
- Requiere acceso del inquilino a la vivienda del item
- No requiere body
- Actualiza `revisado_por_inquilino` a `true`

Notas:

- `POST /viviendas/:viviendaId/inventario` crea los items con `revisado_por_inquilino = false`
- `GET /viviendas/:viviendaId/inventario` devuelve tambien este flag

## Update 2026-04-11 - Consistencia de datos

- Un usuario inquilino solo puede estar asignado a una `Habitacion` a la vez (`Habitacion.inquilino_id` unico cuando no es `null`).
- Una `Deuda` queda acotada a una pareja `gasto_id` + `deudor_id`; el backend no debe crear dos deudas del mismo gasto para el mismo usuario.
- Las deudas se eliminan en cascada al borrar su `Gasto`; las fotos de inventario al borrar su `ItemInventario`; y los turnos/asignaciones al borrar su `ZonaLimpieza`.
- Los importes siguen saliendo como numeros (`Float`) por compatibilidad de API. La logica de negocio reparte y compara en centimos antes de persistir.
