# Roomies — Contexto del proyecto

> Documento de referencia para agentes e IA. Describe la arquitectura, convenciones y estado actual del proyecto. Actualizar cuando cambie algo relevante.

---

## ¿Qué es Roomies?

Aplicación móvil de gestión de pisos compartidos. Hay dos roles:

- **Casero**: crea viviendas y habitaciones, gestiona inquilinos e incidencias, publica anuncios en el tablón.
- **Inquilino**: se une a una habitación mediante un código de invitación, reporta incidencias, lee y publica anuncios en el tablón.

---

## Stack técnico

| Capa            | Tecnología                                                           |
| --------------- | -------------------------------------------------------------------- |
| Backend         | Node.js + Express 5 + TypeScript                                     |
| ORM             | Prisma 7 (PostgreSQL)                                                |
| Auth            | JWT (`jsonwebtoken`) + bcrypt + Google OAuth (`google-auth-library`) |
| Frontend        | React Native + Expo (SDK 54)                                         |
| Routing         | `expo-router` ~6.0.23 (file-based)                                   |
| HTTP client     | Axios con interceptor Bearer token                                   |
| Token storage   | `expo-secure-store`                                                  |
| Geocoding       | Mapbox Geocoding API                                                 |
| Media uploads   | Cloudinary + `multer` + `multer-storage-cloudinary`                  |
| Auth social     | `expo-auth-session/providers/google` + `expo-web-browser`            |
| Push            | `expo-notifications` + `expo-server-sdk`                             |
| Infraestructura | Docker Compose + Railway (backend desplegado con `backend/Dockerfile`) |

---

## Actualizaciones recientes

### Pulido de casero en vivienda y gastos comunes (Epica 15)

- Los tabs internos de `casero/vivienda/[id]/(tabs)` usan `useViviendaIdParam()` para aislar el `id` de vivienda y evitar colisiones con otras rutas dinamicas como perfiles o incidencias.
- El tab `Opciones` concentra la configuracion de modulos de la vivienda; el resumen queda reservado para datos operativos, habitaciones, incidencias y mensualidades.
- El perfil compartido muestra el rol `CASERO` como `Propietario` y elimina la tarjeta redundante de rol.
- La pantalla `Gastos` del inquilino separa visualmente las deudas entre companeros de los pendientes con el casero, muestra un estado vacio real cuando no hay pagos pendientes y eleva el FAB para que no tape acciones al final del scroll.

### Arquitectura modular y facturacion flexible (Epicas 13 y 14)

- `Vivienda` incorpora los flags `mod_limpieza`, `mod_gastos` y `mod_inventario` con valor por defecto `true`.
- El casero configura esos modulos desde el tab `Opciones` de la vivienda con `PATCH /api/viviendas/:id`.
- El backend usa `protegerModuloVivienda()` para devolver `403` si limpieza, gastos/cobros/mensualidades/deudas o inventario estan desactivados para una vivienda.
- La navegacion del casero y del inquilino oculta tabs de `Limpieza`, `Gastos`, `Cobros` e `Inventario` segun los flags activos.
- `Habitacion.precio` guarda el precio mensual privado de dormitorios habitables. El casero lo ve siempre; el inquilino solo ve el precio de su propia habitacion y el backend devuelve `precio: null` para dormitorios ajenos.
- `Gasto.factura_url` guarda la factura original en Cloudinary. Los gastos pueden crearse con adjunto, fecha y `repartoManual`; el reparto manual acepta cuotas `0`, y si se omite se reparte automaticamente cuadrando centimos.
- El casero puede editar concepto, fecha e importe de facturas emitidas; el importe queda bloqueado si alguna deuda hija esta `PAGADA`.

### Cobros, mensualidades y push (Epica 12)

- El backend expone `GET /api/viviendas/:viviendaId/gastos`, `POST /api/viviendas/:viviendaId/gastos`, `GET /api/viviendas/:viviendaId/deudas`, `PATCH /api/viviendas/:viviendaId/deudas/:deudaId/saldar`, `GET /api/viviendas/:viviendaId/gastos-recurrentes`, `POST /api/viviendas/:viviendaId/gastos-recurrentes` y `GET /api/viviendas/:viviendaId/cobros`.
- `GastoRecurrente` guarda mensualidades activas por vivienda y el cron diario de las `02:00` las transforma en `Gasto` normal con reparto automatico entre inquilinos activos.
- `Deuda` incorpora `justificante_url`; el deudor puede subir imagen con `POST /api/deudas/:deudaId/justificante` usando `multipart/form-data` en el campo `justificante`.
- El casero dispone de una pestana global `Cobros` con selector de vivienda, resumen mensual de pagado/pendiente y visualizacion del justificante cuando existe.
- Las mensualidades se gestionan desde el resumen de cada vivienda del casero; el inquilino no ve ni crea gastos recurrentes.
- El frontend del inquilino mantiene la pestana `Gastos` para gastos puntuales, deudas, facturas originales y bottom sheet de justificante antes de marcar una deuda como pagada.
- El backend expone `PATCH /api/usuarios/me/push-token` y el alias legado `PUT /api/usuarios/push-token` para registrar el `expo_push_token` del usuario autenticado.
- El frontend sincroniza el token push desde `app/_layout.tsx`, login, registro y selector de rol; en Expo Go el registro se omite y solo funciona en dispositivo fisico o build nativa.
- El cron mensual `0 12 5 * *` envia recordatorios push a deudores con deudas `PENDIENTE` y token Expo registrado.

### Inventario del casero

- El módulo de inventario expone `POST /api/viviendas/:viviendaId/inventario`, `GET /api/viviendas/:viviendaId/inventario` y `POST /api/inventario/:itemId/fotos`.
- El flujo del casero crea primero el item y después puede subir una foto con `multipart/form-data` en el campo `foto`.
- El frontend del casero incorpora una pestaña `Inventario` con selector de vivienda, agrupado por ubicación y alta de items con `expo-image-picker`.

- `ItemInventario` incorpora el campo `revisado_por_inquilino` con valor por defecto `false`.
- El backend expone `PATCH /api/inventario/:itemId/conformidad` para que el inquilino marque un item como validado.
- El frontend del inquilino incorpora la pestaña `Inventario` con agrupado por habitación/zona, galería de fotos y modal de revisión.
- Si el item no coincide, el flujo redirige al módulo de incidencias mediante un `Alert` nativo.

- El backend desplegado en Railway se construye con `backend/Dockerfile`.
- Se añadió infraestructura de inventario con `ItemInventario` y `FotoAsset` en Prisma.
- La subida de fotos del inventario usa Cloudinary con `multer` + `multer-storage-cloudinary`.
- El endpoint disponible es `POST /api/inventario/:itemId/fotos` y espera `multipart/form-data` con el archivo en el campo `foto`.
- Para backend local y Railway ahora son obligatorias las variables `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`.

---

## Estructura de carpetas

```
Roomies/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       ← modelos de datos
│   │   └── seed.ts             ← datos de prueba
│   ├── src/
│   │   ├── controllers/        ← lógica de negocio
│   │   │   ├── auth.controller.ts       ← login, registro, Google OAuth, selector de rol
│   │   │   ├── anuncio.controller.ts    ← CRUD tablón de anuncios
│   │   │   ├── incidencia.controller.ts ← crear, listar, cambiar estado (permisos granulares)
│   │   │   ├── inquilino.controller.ts  ← unirse, ver vivienda, abandonar, perfil de inquilino
│   │   │   └── vivienda.controller.ts   ← CRUD viviendas y habitaciones, expulsar inquilino
│   │   ├── generated/prisma/   ← cliente Prisma generado (no editar)
│   │   ├── lib/prisma.ts       ← instancia singleton de PrismaClient
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts  ← verificarToken (adjunta req.usuario)
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── anuncio.routes.ts
│   │   │   ├── incidencia.routes.ts
│   │   │   ├── inquilino.routes.ts
│   │   │   └── vivienda.routes.ts
│   │   ├── types/express/
│   │   │   └── index.d.ts      ← extensión de tipos Express (req.usuario)
│   │   ├── utils/
│   │   │   └── generarCodigo.ts    ← generarCodigoInvitacion()
│   │   └── index.ts            ← entry point Express
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx         ← layout raíz: guard de sesión JWT + Stack navigator
│   │   ├── index.tsx           ← Login
│   │   ├── registro.tsx        ← Registro
│   │   ├── rol.tsx             ← Selector de rol (post-OAuth para usuarios nuevos)
│   │   ├── perfil.tsx          ← Perfil + logout (compartido entre roles vía re-export)
│   │   ├── casero/
│   │   │   ├── _layout.tsx             ← Stack del casero (apila pantallas sobre el tab bar)
│   │   │   ├── nueva-vivienda.tsx      ← crear vivienda (con habitaciones inline)
│   │   │   ├── inquilino/
│   │   │   │   └── [id].tsx            ← perfil de contacto del inquilino (solo para el casero)
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx         ← Tab bar casero: Mis viviendas | Tablón | Perfil
│   │   │   │   ├── viviendas.tsx       ← lista de viviendas del casero
│   │   │   │   ├── tablon.tsx          ← tablón del casero (auto-fetch viviendaId)
│   │   │   │   └── perfil.tsx          ← re-export de app/perfil.tsx
│   │   │   ├── inquilino/
│   │   │   │   └── [id].tsx            ← perfil del inquilino (accesible desde tarjeta de habitación)
│   │   │   └── vivienda/
│   │   │       └── [id]/               ← Stack externo que aloja tabs + modales de habitación
│   │   │           ├── _layout.tsx     ← Stack sin header (permite apilar modales sobre las tabs)
│   │   │           ├── nueva-habitacion.tsx
│   │   │           ├── editar-habitacion.tsx
│   │   │           └── (tabs)/         ← Tabs anidadas: centro de mandos de la vivienda
│   │   │               ├── _layout.tsx ← Tab bar vivienda + botón ← en headerLeft
│   │   │               ├── index.tsx   ← Resumen: habitaciones, inquilinos, códigos
│   │   │               ├── incidencias.tsx ← incidencias de la vivienda
│   │   │               ├── tablon.tsx  ← tablón de anuncios de esta vivienda
│   │   │               └── opciones.tsx ← configuracion de modulos de la vivienda
│   │   ├── inquilino/
│   │   │   ├── _layout.tsx             ← Stack del inquilino
│   │   │   ├── nueva-incidencia.tsx
│   │   │   └── (tabs)/
│   │   │       ├── _layout.tsx         ← Tab bar inquilino: Mi vivienda | Tablón | Perfil
│   │   │       ├── inicio.tsx          ← onboarding + dashboard inquilino
│   │   │       ├── tablon.tsx          ← tablón del inquilino (auto-fetch viviendaId)
│   │   │       └── perfil.tsx          ← re-export de app/perfil.tsx
│   │   ├── tablon/
│   │   │   └── [viviendaId].tsx        ← tablón con viviendaId explícito en URL
│   │   └── incidencia/
│   │       └── [id].tsx                ← detalle de incidencia
│   ├── components/
│   │   └── common/
│   │       ├── CustomButton.tsx        ← botón reutilizable: primary|secondary|outline|danger|success
│   │       ├── CustomButton.styles.ts
│   │       ├── Card.tsx                ← contenedor con sombra; Pressable si recibe onPress
│   │       ├── Card.styles.ts
│   │       ├── CustomInput.tsx         ← input con label, foco, error y secureToggle
│   │       ├── CustomInput.styles.ts
│   │       └── LoadingScreen.tsx       ← ActivityIndicator centrado a pantalla completa
│   ├── constants/
│   │   ├── theme.ts                    ← design tokens: colors, spacing, radius, typography
│   │   └── toastConfig.tsx             ← config visual de react-native-toast-message (usa Theme)
│   ├── services/
│   │   ├── api.ts              ← instancia Axios con baseURL + interceptor
│   │   └── auth.service.ts     ← guardarToken / obtenerToken / eliminarToken
│   ├── styles/                 ← un .styles.ts por pantalla, nunca inline en el componente
│   │   ├── index.styles.ts
│   │   ├── registro.styles.ts
│   │   ├── rol.styles.ts
│   │   ├── perfil.styles.ts
│   │   ├── home.styles.ts
│   │   ├── casero/
│   │   │   ├── viviendas.styles.ts
│   │   │   ├── nueva-vivienda.styles.ts
│   │   │   ├── inquilino/
│   │   │   │   └── perfil.styles.ts        ← estilos de la pantalla de perfil del inquilino
│   │   │   └── vivienda/
│   │   │       ├── detalle.styles.ts       ← estilos del tab Resumen (index.tsx)
│   │   │       ├── incidencias.styles.ts   ← estilos del tab Incidencias
│   │   │       └── nueva-habitacion.styles.ts  ← reutilizado también por editar-habitacion.tsx
│   │   ├── inquilino/
│   │   │   ├── inicio.styles.ts            ← incluye COLORES_PRIORIDAD, estilos del modal compañero
│   │   │   └── nueva-incidencia.styles.ts  ← incluye COLORES_PRIORIDAD, ETIQUETAS_PRIORIDAD
│   │   ├── incidencia/
│   │   │   └── detalle.styles.ts
│   │   └── tablon/
│   │       └── tablon.styles.ts            ← compartido por casero, inquilino y vivienda tabs
│   ├── frontend/.env           ← variables EXPO_PUBLIC_* (baked en Metro)
│   └── package.json
├── docs/
│   ├── backend/api.md          ← documentación de endpoints REST
│   ├── frontend/setup.md       ← guía de configuración, estructura, navegación, diseño
│   └── changelog/              ← un .md por issue implementado
├── .env                        ← variables raíz (Docker Compose las lee)
├── docker-compose.yml
└── CONTEXT.md                  ← este archivo
```

---

## Modelos de datos (Prisma)

### `Usuario`

| Campo           | Tipo           | Notas                                         |
| --------------- | -------------- | --------------------------------------------- |
| `id`            | Int PK         | autoincrement                                 |
| `nombre`        | String         | obligatorio                                   |
| `apellidos`     | String?        | opcional (OAuth no siempre lo provee)         |
| `documento_identidad` | String? unique | obligatorio en registro manual (DNI, NIE o pasaporte) |
| `email`         | String unique  |                                               |
| `password_hash` | String?        | null si el usuario se registró con Google     |
| `google_id`     | String? unique | null si el usuario se registró con email/pass |
| `telefono`           | String?        | obligatorio en registro manual                |
| `rol`                | RolUsuario     | `CASERO` \| `INQUILINO`                       |
| `expo_push_token`    | String?        | token Expo opcional para recordatorios de pago y avisos push |
| `correo_verificado`  | Boolean        | `@default(false)`; el login lo exige en `true` |
| `token_verificacion` | String?        | token hex-32 generado al registrarse; null tras verificar |

### `Vivienda`

| Campo           | Tipo         |
| --------------- | ------------ |
| `id`            | Int PK       |
| `casero_id`     | FK → Usuario |
| `alias_nombre`  | String       |
| `direccion`     | String       |
| `codigo_postal` | String       |
| `ciudad`        | String       |
| `provincia`     | String       |
| `mod_limpieza`  | Boolean      |
| `mod_gastos`    | Boolean      |
| `mod_inventario` | Boolean     |

### `Habitacion`

| Campo               | Tipo           | Notas                                                   |
| ------------------- | -------------- | ------------------------------------------------------- |
| `id`                | Int PK         |                                                         |
| `vivienda_id`       | FK → Vivienda  |                                                         |
| `inquilino_id`      | FK → Usuario?  | null si sin inquilino                                   |
| `nombre`            | String         |                                                         |
| `tipo`              | TipoHabitacion | `DORMITORIO` \| `BANO` \| `COCINA` \| `SALON` \| `OTRO` |
| `es_habitable`      | Boolean        | si true, tiene código de invitación                     |
| `metros_cuadrados`  | Float?         |                                                         |
| `precio`            | Float?         | precio mensual privado; solo visible para casero o inquilino asignado |
| `codigo_invitacion` | String? unique | se genera con `generarCodigoInvitacion()`               |

### `Incidencia`

| Campo            | Tipo                                      | Notas                                           |
| ---------------- | ----------------------------------------- | ----------------------------------------------- |
| `id`             | Int PK                                    |                                                 |
| `vivienda_id`    | FK → Vivienda                             |                                                 |
| `creador_id`     | FK → Usuario                              |                                                 |
| `habitacion_id`  | FK → Habitacion?                          | opcional; el backend rechaza dormitorios ajenos |
| `titulo`         | String                                    |                                                 |
| `descripcion`    | String                                    |                                                 |
| `estado`         | `PENDIENTE` \| `EN_PROCESO` \| `RESUELTA` |                                                 |
| `prioridad`      | `VERDE` \| `AMARILLO` \| `ROJO`           |                                                 |
| `fecha_creacion` | DateTime                                  |                                                 |

### `Anuncio`

| Campo            | Tipo          | Notas                                     |
| ---------------- | ------------- | ----------------------------------------- |
| `id`             | Int PK        | autoincrement                             |
| `vivienda_id`    | FK → Vivienda |                                           |
| `autor_id`       | FK → Usuario  |                                           |
| `titulo`         | String        |                                           |
| `contenido`      | String        |                                           |
| `fecha_creacion` | DateTime      | `@default(now())`                         |

### `Gasto`

| Campo            | Tipo          | Notas |
| ---------------- | ------------- | ----- |
| `id`             | Int PK        | autoincrement |
| `vivienda_id`    | FK -> Vivienda | gasto asociado a una vivienda |
| `pagador_id`     | FK -> Usuario  | usuario que adelanta el pago |
| `concepto`       | String        | descripcion corta del gasto |
| `importe`        | Float         | importe total |
| `factura_url`    | String?       | URL Cloudinary de la factura original |
| `fecha_creacion` | DateTime      | `@default(now())` |

### `GastoRecurrente`

| Campo         | Tipo          | Notas |
| ------------- | ------------- | ----- |
| `id`          | Int PK        | autoincrement |
| `concepto`    | String        | nombre de la mensualidad |
| `importe`     | Float         | importe total a repartir |
| `dia_del_mes` | Int           | entero entre `1` y `31` |
| `vivienda_id` | FK -> Vivienda | vivienda donde se genera |
| `pagador_id`  | FK -> Usuario  | usuario que queda como pagador del gasto generado |
| `activo`      | Boolean       | `@default(true)` |

### `Deuda`

| Campo              | Tipo                    | Notas |
| ------------------ | ----------------------- | ----- |
| `id`               | Int PK                  | autoincrement |
| `gasto_id`         | FK -> Gasto             | deuda derivada de un gasto |
| `deudor_id`        | FK -> Usuario           | usuario que debe pagar |
| `acreedor_id`      | FK -> Usuario           | usuario que debe cobrar |
| `importe`          | Float                   | importe individual |
| `estado`           | `PENDIENTE` \| `PAGADA` | estado actual |
| `justificante_url` | String?                 | URL Cloudinary del comprobante si el deudor lo sube |

---

## API REST (base: `/api`)

### Auth — `/auth`

| Método | Ruta             | Auth | Descripción                                                                                           |
| ------ | ---------------- | ---- | ----------------------------------------------------------------------------------------------------- |
| POST   | `/auth/register`         | No   | Registro con email/pass. Campos: `nombre`, `apellidos`, `documento_identidad`, `email`, `telefono`, `password`, `rol`. Devuelve `{ mensaje }`. Envía magic link al email. |
| GET    | `/auth/verificar/:token` | No   | Verifica el correo. Si OK → redirect `roomies://verificacion?status=success`. |
| POST   | `/auth/login`            | No   | Login con email/pass. Devuelve `403` si `correo_verificado` es `false`.      |
| POST   | `/auth/google`   | No   | Login/registro con Google. Body: `{ idToken }`. Devuelve `esNuevo: boolean`                           |
| GET    | `/auth/me`       | Sí   | Perfil del usuario autenticado                                                                        |
| PATCH  | `/auth/rol`      | Sí   | Actualiza el rol del usuario y re-emite el JWT. Body: `{ rol: "CASERO" \| "INQUILINO" }`              |

### Viviendas — `/viviendas`

| Método | Ruta                                           | Auth | Descripción                                                                |
| ------ | ---------------------------------------------- | ---- | -------------------------------------------------------------------------- |
| GET    | `/viviendas`                                   | Sí   | Lista viviendas del casero autenticado                                     |
| POST   | `/viviendas`                                   | Sí   | Crea vivienda (acepta array opcional `habitaciones`)                       |
| GET    | `/viviendas/:id`                               | Sí   | Detalle con habitaciones e inquilinos                                      |
| PATCH  | `/viviendas/:id`                               | Sí   | Actualiza `mod_limpieza`, `mod_gastos` y/o `mod_inventario` de la vivienda |
| POST   | `/viviendas/:id/habitaciones`                  | Sí   | Añade habitación suelta                                                    |
| PUT    | `/viviendas/:id/habitaciones/:habId`           | Sí   | Edita habitación                                                           |
| DELETE | `/viviendas/:id/habitaciones/:habId`           | Sí   | Elimina habitación (falla si tiene inquilino)                              |
| DELETE | `/viviendas/:id/habitaciones/:habId/inquilino` | Sí   | Casero expulsa al inquilino de una habitación (pone `inquilino_id` a null) |

### Inquilino — `/inquilino`

| Método | Ruta                       | Auth | Descripción                                                                                                 |
| ------ | -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------- |
| POST   | `/inquilino/unirse`        | Sí   | Canjear código de invitación                                                                                |
| GET    | `/inquilino/vivienda`      | Sí   | Vivienda completa del inquilino (habitaciones + inquilinos)                                                 |
| DELETE | `/inquilino/habitacion`    | Sí   | El inquilino abandona su habitación (pone `inquilino_id` a null)                                            |
| GET    | `/inquilino/:id/perfil`    | Sí   | Perfil de contacto de un inquilino. Solo accesible si ese inquilino vive en una vivienda del casero que pide |

### Incidencias — `/incidencias`

| Método | Ruta                      | Auth | Descripción                                                                                                                              |
| ------ | ------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/incidencias`            | Sí   | Crear incidencia (acepta `habitacion_id` opcional; validado contra dormitorios ajenos)                                                   |
| GET    | `/incidencias`            | Sí   | Listar incidencias (casero: todas sus viviendas; inquilino: su vivienda)                                                                 |
| PATCH  | `/incidencias/:id/estado` | Sí   | Cambiar estado. Casero: libre en sus viviendas. Inquilino: solo si es creador, la incidencia es de su dormitorio, o es de una zona común |

### Anuncios — `/anuncios`

Tablón de anuncios por vivienda. Todos los miembros de la vivienda (casero e inquilinos) pueden publicar y leer anuncios. Solo el autor o el casero de la vivienda puede eliminarlos.

| Método | Ruta            | Auth | Descripción                                                                         |
| ------ | --------------- | ---- | ----------------------------------------------------------------------------------- |
| GET    | `/anuncios?viviendaId=X` | Sí | Lista anuncios de la vivienda (más reciente primero). Incluye `autor { id, nombre }` |
| POST   | `/anuncios`     | Sí   | Publica anuncio. Body: `{ titulo, contenido, vivienda_id }`                         |
| DELETE | `/anuncios/:id` | Sí   | Elimina anuncio. Solo el autor o el casero de la vivienda                           |

### Finanzas - `/viviendas/:viviendaId`

| Metodo | Ruta | Auth | Descripcion |
| ------ | ---- | ---- | ----------- |
| GET    | `/viviendas/:viviendaId/gastos` | Si | Lista gastos de la vivienda con pagador y `deudas[]` |
| POST   | `/viviendas/:viviendaId/gastos` | Si | Crea gasto y reparte deuda entre inquilinos activos; acepta `implicadosIds`, `repartoManual`, `fecha` y adjunto `factura` opcionales |
| PATCH  | `/viviendas/:viviendaId/gastos/:gastoId` | Si | Edita concepto, fecha e importe de un gasto; el importe se bloquea si hay deudas pagadas |
| POST   | `/viviendas/:viviendaId/gastos/:gastoId/factura` | Si | Sube o reemplaza la factura original de un gasto |
| GET    | `/viviendas/:viviendaId/deudas` | Si | Lista deudas donde el usuario autenticado es deudor o acreedor |
| PATCH  | `/viviendas/:viviendaId/deudas/:deudaId/saldar` | Si | Marca una deuda como `PAGADA`; solo el deudor puede hacerlo |
| GET    | `/viviendas/:viviendaId/gastos-recurrentes` | Si | Lista mensualidades activas o inactivas de la vivienda |
| POST   | `/viviendas/:viviendaId/gastos-recurrentes` | Si | Crea una mensualidad recurrente con `concepto`, `importe` y `dia_del_mes` |
| GET    | `/viviendas/:viviendaId/cobros` | Si | Dashboard mensual del casero con resumen pagado o pendiente y detalle de justificantes |

### Deudas - `/deudas`

| Metodo | Ruta | Auth | Descripcion |
| ------ | ---- | ---- | ----------- |
| POST   | `/deudas/:deudaId/justificante` | Si | Sube un justificante de pago a Cloudinary; campo multipart `justificante` |

### Usuarios - `/usuarios`

| Metodo | Ruta | Auth | Descripcion |
| ------ | ---- | ---- | ----------- |
| PATCH  | `/usuarios/me/push-token` | Si | Guarda o limpia (`token: null`) el `expo_push_token` del usuario autenticado |
| PUT    | `/usuarios/push-token` | Si | Alias legado del mismo flujo |

---

## Variables de entorno

### `.env` (raíz — leído por Docker Compose)

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=roomies
JWT_SECRET=roomies_dev_secret_local
HOST_IP=<IP de la máquina en la red local>
EXPO_PUBLIC_MAPBOX_TOKEN=<token Mapbox>
GOOGLE_CLIENT_ID=<Web Client ID de Google Cloud Console>
```

### `backend/.env` (para desarrollo local sin Docker)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/roomies
JWT_SECRET=roomies_dev_secret_local
GOOGLE_CLIENT_ID=<mismo que arriba>
CLOUDINARY_CLOUD_NAME=<cloud_name de Cloudinary>
CLOUDINARY_API_KEY=<api_key de Cloudinary>
CLOUDINARY_API_SECRET=<api_secret de Cloudinary>
```

### `frontend/.env` (leído por Metro en tiempo de compilación)

El proyecto tiene tres entornos de API — descomenta el que quieras usar:

```
# Desarrollo en Railway (por defecto)
EXPO_PUBLIC_API_URL=https://roomies-dev.up.railway.app/api

# Producción en Railway
#EXPO_PUBLIC_API_URL=https://roomies-production-c884.up.railway.app/api

# Local con Docker Compose
#EXPO_PUBLIC_API_URL=http://<HOST_IP>:3001/api

EXPO_PUBLIC_MAPBOX_TOKEN=<token Mapbox>
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<Web Client ID>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<Android Client ID o vacío>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<iOS Client ID o vacío>
```

> Las variables `EXPO_PUBLIC_*` se hornean en el bundle de Metro. Cambiarlas requiere reiniciar Metro con `--clear`.
> El registro de push usa `expo-notifications` y el `projectId` definido en `frontend/app.json` (`expo.extra.eas.projectId`), no una variable `EXPO_PUBLIC_*` adicional.

### `.env.example` disponibles

Cada subcarpeta tiene su propio `.env.example` con todos los campos documentados:
- `.env.example` — raíz (Docker Compose)
- `backend/.env.example` — backend local / Railway
- `frontend/.env.example` — frontend con los tres entornos de API comentados

---

## Railway, Expo Go y Docker

El testeo funcional diario se hace levantando Expo Go contra Railway desarrollo:

1. `frontend/.env` apunta a `EXPO_PUBLIC_API_URL=https://roomies-dev.up.railway.app/api`.
2. Se ejecuta `npx expo start --clear` en `frontend`.
3. La app se abre desde Expo Go.

El backend usa dos servicios Railway: desarrollo para pruebas y produccion para releases. `backend/Dockerfile` existe para que Railway construya la imagen del backend.

El `backend/Dockerfile` ejecuta:

1. `npm run build` durante la construccion de la imagen.
2. `npm start` al arrancar el contenedor.

`npm start` ejecuta `npx prisma db push --accept-data-loss` y `node dist/index.js`.

`docker-compose.yml` queda como apoyo opcional para revisar infraestructura local. En ese modo, el servicio backend sobreescribe el comando de la imagen Railway y ejecuta:

1. `npx prisma generate` - regenera el cliente despues del bind mount.
2. `npx prisma db push --accept-data-loss` - aplica el schema.
3. `npm run dev` - arranca el servidor con nodemon.

Si `RESET_DB=true`, sustituye el `db push --accept-data-loss` por `db push --force-reset` y ejecuta `npx prisma db seed` antes de arrancar.

**Puertos**: PostgreSQL en `5433:5432`, backend en `3001:3000`, frontend en `8080:8080`.

> El puerto 8080 se usa en lugar de 8081 para evitar conflictos con reglas de firewall de Windows.
> El frontend del compose lee `EXPO_PUBLIC_API_URL` desde `.env`; para Expo Go en movil fisico debe apuntar a `http://<HOST_IP>:3001/api`.

---

## Sistema de Diseño (Épica 9 — "Amigable y Colorido")

### Tokens (`frontend/constants/theme.ts`)

| Token | Valor | Uso |
|---|---|---|
| `colors.primary` | `#FF6B6B` | Coral cálido — acento principal |
| `colors.primaryLight` | `#FFF0F0` | Fondo de focus state en inputs |
| `colors.background` | `#F8F7F4` | Off-white cálido (fondo de pantallas) |
| `colors.surface` | `#FFFFFF` | Cards, inputs |
| `colors.surface2` | `#F2F0EB` | Chips y elementos secundarios |
| `colors.border` | `#E8E6E0` | Bordes cálidos (2px en inputs y pills) |
| `radius.md` | `16` | Inputs, chips menores |
| `radius.lg` | `24` | Cards, botones, modales |
| `radius.xl` | `32` | Bottom sheets, hero cards |
| `radius.full` | `100` | Pills, avatares |
| `spacing.xxl` | `48` | Separación entre secciones grandes |
| `typography.subtitle` | `18` | Títulos de sección intermedios |

### Patrones recurrentes

- **Focus state en inputs**: `borderWidth: 2`, `borderColor: border` en reposo; al recibir foco aplica clase `inputFocused` con `borderColor: primary` + `backgroundColor: primaryLight`. Controlado con `useState<string | null>(null)` + `onFocus`/`onBlur`.
- **Soft tint para pills activos**: fondo `primary + '18'` (hex con opacidad ~10%), texto `primary`, borde `primary`. Inactivo: `backgroundColor: 'transparent'`, `borderColor: border`.
- **Soft tint de prioridad/estado** (módulo incidencias): mapas de color semánticos en el archivo `.styles.ts` correspondiente:
  - `VERDE` → bg `#E5FAF3`, text `#0D7A5E`
  - `AMARILLO` → bg `#FFF5E0`, text `#A05C00`
  - `ROJO` → bg `#FFE8E8`, text `#C0392B`
  - Usado en `incidencias.styles.ts` y `detalle.styles.ts` vía `PRIORIDAD_BG`, `PRIORIDAD_TEXT`, `PRIORIDAD_BORDER` / `ESTADO_PILL_BG`, `ESTADO_PILL_TEXT`.
- **Botón destructivo suave**: fondo `danger + '18'`, borde `danger + '40'` (en lugar de rojo sólido).
- **Empty states**: caja de icono 80–88px con `borderRadius: xl` + fondo tinted, título bold, subtítulo secundario. CTA solo para el rol creador.
- **Tab bar**: sin `borderTopWidth`; elevación suave (`elevation: 12`, `shadowOpacity: 0.07`).
- **Bottom sheet modal**: `borderTopLeftRadius: xl`, `borderTopRightRadius: xl`; handle bar `40×4px`; backdrop `Pressable rgba(0,0,0,0.4)` para cerrar.
- **Press feedback**: `opacity` + `transform: [{ scale }]` en Pressables de tarjetas.
- **placeholderTextColor**: siempre `Theme.colors.textMuted` (nunca hex literal).
- **Switch trackColor**: siempre `{ false: Theme.colors.border, true: Theme.colors.success }`.

### Archivos de estilos con exports nombrados clave

| Archivo | Exports adicionales |
|---|---|
| `styles/casero/vivienda/incidencias.styles.ts` | `PRIORIDAD_BG`, `PRIORIDAD_TEXT`, `ESTADO_PILL_BG`, `ESTADO_PILL_TEXT` |
| `styles/incidencia/detalle.styles.ts` | ídem + `PRIORIDAD_BORDER` |
| `styles/tablon/tablon.styles.ts` | compartido por los 3 tablones de tab (casero, casero-vivienda, inquilino) |
| `styles/inquilino/nueva-incidencia.styles.ts` | `COLORES_PRIORIDAD`, `ETIQUETAS_PRIORIDAD` |
| `styles/casero/vivienda/nueva-incidencia.styles.ts` | `COLORES_PRIORIDAD`, `ETIQUETAS_PRIORIDAD` |
| `styles/casero/vivienda/nueva-habitacion.styles.ts` | reutilizado también por `editar-habitacion.tsx` |

---

## Convenciones de código

### Backend

- Los controllers exportan `RequestHandler` tipados de Express 5.
- El tipo `req.usuario` se añade en `auth.middleware.ts` al verificar el JWT.
- Prisma se importa desde `../lib/prisma` (singleton).
- Los enums se importan desde `../generated/prisma/client`.
- `generarCodigoInvitacion()` está en `src/utils/generarCodigo.ts`.

### Frontend

- **Estilos**: cada pantalla tiene su archivo `.styles.ts` en `styles/` con la misma ruta relativa que la pantalla. Nunca `StyleSheet.create` inline en el componente.
- **Componentes base**: usar `CustomButton`, `Card` y `CustomInput` de `components/common/` en lugar de primitivos directos (`Pressable`+estilos inline, `View`+sombra manual, `TextInput`+label manual).
- **Design tokens**: usar `Theme` de `constants/theme.ts` para todos los valores de color, spacing, radius y tipografía. Nunca hex literals ni magic numbers en estilos. Ver sección "Sistema de Diseño" para los patrones de Épica 9 (soft tints, focus states, empty states, etc.).
- **Navegación**: usar `router.replace()` (de `expo-router`) para navegar entre sesiones (login → dashboard, logout → index, selector de rol → dashboard). Nunca `CommonActions.reset` de React Navigation — no resuelve los grupos `(tabs)` de Expo Router.
- **Token**: guardar/recuperar/eliminar con las funciones de `services/auth.service.ts`.
- **API**: importar la instancia Axios de `@/services/api`. El interceptor inyecta el Bearer token automáticamente.
- **Variables de entorno**: solo `EXPO_PUBLIC_*` son accesibles en el frontend. Se leen con `process.env.EXPO_PUBLIC_*`.
- **Autocompletado de habitaciones**: al seleccionar tipo BANO, COCINA o SALON en los formularios de habitación, el campo nombre se rellena automáticamente con el nombre canónico. Sigue siendo editable.
- **Íconos**: usar exclusivamente `Ionicons` de `@expo/vector-icons`. Nunca emojis como íconos estructurales. Tamaño estándar 24px (detalle/hero: 32–40px). El color se tokeniza con `Theme.colors.*`.
- **Portapapeles y códigos**: los códigos se almacenan con prefijo `ROOM-` en la BD, pero al copiar al portapapeles se limpia el prefijo con `/^room[-\s]*/i` para que el inquilino solo pegue la parte alfanumérica.
- **Contadores en lista de viviendas**: `habitacionesHabitables` filtra `hab.tipo === 'DORMITORIO'`; `inquilinosActuales` cuenta las habitables con `inquilino_id !== null`. No usar `habitaciones.length` directamente (incluye zonas comunes).

### Routing (expo-router)

- Las rutas de archivo se mapean directamente a URLs.
- `[id].tsx` → pantalla de detalle con param `id`.
- `[id]/nueva-habitacion.tsx` → subruta con acceso a `id` mediante `useLocalSearchParams`.
- Los grupos `(tabs)` son transparentes en URL: `casero/(tabs)/viviendas.tsx` se accede como `/casero/viviendas`.
- Cada rol tiene su propio grupo `(tabs)` con tres pestañas:
  - **Casero**: Mis viviendas (`viviendas`) · Tablón (`tablon`) · Perfil (`perfil`)
  - **Inquilino**: Mi vivienda (`inicio`) · Tablón (`tablon`) · Perfil (`perfil`)
- Las pantallas de formulario/detalle (nueva vivienda, nueva incidencia, detalle incidencia) se apilan sobre el tab bar gracias al `Stack` en `casero/_layout.tsx` e `inquilino/_layout.tsx`.
- El tablón principal de cada rol es un tab autónomo: obtiene `viviendaId` vía API en lugar de recibirlo por URL.
- La pestaña "Perfil" de cada rol es un re-export de `app/perfil.tsx` para evitar duplicación.
- **Nested Tabs en detalle de vivienda**: `casero/vivienda/[id]/` tiene una doble capa Stack + Tabs anidados:
  - `[id]/_layout.tsx` — Stack externo sin header. Permite que `editar-habitacion` y `nueva-habitacion` se comporten como stack pushes (ocultan el tab bar de la vivienda).
  - `[id]/(tabs)/_layout.tsx` — Tab bar de la vivienda con botón `←` en `headerLeft` (`router.back()` vuelve a la lista de viviendas). Tres tabs: Resumen · Incidencias · Tablón.
  - Las rutas `[id]/editar-habitacion` y `[id]/nueva-habitacion` se apilan sobre las tabs — el tab bar desaparece mientras se edita.
- **`<Stack.Screen>` dentro del componente**: algunas pantallas Stack configuran su propio header desde el componente (e.g., `casero/inquilino/[id].tsx`) sin tocar el `_layout.tsx` del segmento. Esto es compatible con Expo Router y permite personalizar el header caso a caso.

---

## Flujo de autenticación

1. **Inicio de app**: `app/_layout.tsx` verifica si existe un JWT almacenado:
   - Lee el token con `obtenerToken()` (SecureStore).
   - Si hay token, llama `GET /auth/me` para obtener el rol.
   - Redirige con `router.replace()` al dashboard correspondiente.
   - Si el token es inválido o expirado, lo borra con `eliminarToken()` y deja al usuario en el login.
   - Muestra un `ActivityIndicator` como overlay mientras verifica (el Stack se renderiza siempre para que `router.replace()` tenga destino).
2. **Registro manual**: `POST /auth/register` → devuelve nada (201). El usuario va al login.
3. **Login manual**: `POST /auth/login` → devuelve `{ token, usuario }`. Se guarda el token con `guardarToken`. Se navega con `router.replace()` al dashboard según el rol.
4. **Google OAuth**:
   - `expo-auth-session` obtiene un `idToken` en el dispositivo.
   - Se envía a `POST /auth/google` → el backend lo verifica con `google-auth-library` → upsert del usuario.
   - Devuelve `{ token, usuario, esNuevo: boolean }`.
   - Si `esNuevo === true` → frontend redirige a `/rol` (selector de rol).
   - Si `esNuevo === false` → `router.replace()` al dashboard según `usuario.rol`.
5. **Selector de rol** (`/rol`): pantalla con dos cards (Casero / Inquilino). Al confirmar:
   - `PATCH /auth/rol` con `{ rol }` → backend actualiza BD y re-emite un nuevo JWT con el rol correcto.
   - Frontend guarda el nuevo token y navega con `router.replace()` al dashboard.
6. **Sesión**: el token JWT se almacena en `expo-secure-store`. El interceptor de Axios lo inyecta en cada petición.
7. **Logout**: `eliminarToken()` + `router.replace('/')` a la pantalla de login.

---

## Flujo del inquilino

1. Recibe un código de invitación del casero (solo la parte alfanumérica, sin el prefijo `ROOM-`).
2. `POST /inquilino/unirse` con `{ codigo_invitacion: "ROOM-XXXXXX" }` → queda asignado a la habitación.
3. Accede al dashboard `inquilino/(tabs)/inicio`:
   - `GET /inquilino/vivienda` carga la vivienda completa con todas las habitaciones e inquilinos.
   - Sección "Compañeros de piso": dormitorios con inquilino asignado (excepto el propio). Cada compañero es tappable: abre un `Modal` con fondo semitransparente que muestra nombre, apellidos y — tras fetch async a `GET /inquilino/companeros/:id` — email (icono `mail-outline`) y teléfono (icono `call-outline`) si están disponibles.
   - Sección "Zonas comunes": habitaciones que no son DORMITORIO.
   - Sección "Incidencias": `GET /incidencias` filtra por la vivienda del inquilino.
4. Puede crear incidencias desde `inquilino/nueva-incidencia`:
   - Selector de habitación filtrado: solo zonas comunes + propia habitación.
   - `habitacion_id` es opcional en el POST — si se envía y apunta a un dormitorio ajeno, el backend devuelve 403.
   - En el dashboard, cada tarjeta de incidencia muestra un selector de estado (3 pills: Pendiente / En proceso / Resuelta) si el inquilino tiene permiso, o el estado como texto de solo lectura si no. Permisos: es creador **o** la incidencia está en su dormitorio **o** está en una zona común.
5. **Ciclo de vida**:
   - El inquilino puede abandonar su habitación: botón "Abandonar Vivienda" (outline rojo) al final del dashboard → `DELETE /inquilino/habitacion` → la pantalla regresa al onboarding de forma inmediata (reset de estado local, sin navegación).
   - El casero puede expulsar a un inquilino: pulsando la tarjeta de habitación → `editar-habitacion` → botón "Expulsar al inquilino" (visible solo si hay inquilino) → `DELETE /viviendas/:id/habitaciones/:habId/inquilino` → `router.back()`.
   - Eliminar la habitación también se hace desde `editar-habitacion` (botón "Eliminar habitación", siempre visible); falla en backend (400) si aún tiene inquilino asignado.

---

## Seed de desarrollo

Usuarios de prueba creados por `prisma db seed`:

| Email              | Password    | Rol       |
| ------------------ | ----------- | --------- |
| casero@test.com    | `casero123` | CASERO    |
| inquilino@test.com | `casero123` | INQUILINO |

---

## Documentación adicional

- `docs/backend/api.md` — referencia completa de endpoints con ejemplos de body/response.
- `docs/frontend/setup.md` — guía de configuración del frontend, variables de entorno, estructura de la app, flujo de autenticación y decisiones de arquitectura.
- `docs/changelog/` — un archivo por issue implementado, con decisiones técnicas.

## Update 2026-04-10 - Arquitectura modular y facturacion flexible (Epicas 13 y 14)

- Backend:
  - `Vivienda` tiene flags `mod_limpieza`, `mod_gastos` y `mod_inventario`; `PATCH /api/viviendas/:id` permite al casero propietario activarlos o desactivarlos.
  - `protegerModuloVivienda()` protege limpieza, gastos, deudas, cobros, mensualidades recurrentes e inventario con 403 si el modulo esta desactivado.
  - `Habitacion.precio` se persiste solo en habitaciones habitables; al convertir una habitacion en no habitable se limpia a `null`.
  - `Gasto.factura_url` permite conservar facturas originales en Cloudinary.
  - `POST /api/viviendas/:viviendaId/gastos` acepta `multipart/form-data`, `factura`, `fecha` y `repartoManual`.
  - `PATCH /api/viviendas/:viviendaId/gastos/:gastoId` edita concepto, fecha e importe; el importe no se puede cambiar si alguna deuda hija esta `PAGADA`.
- Frontend:
  - El tab `Opciones` del casero muestra switches de modulos por vivienda mediante `ModulosViviendaManager`.
  - Las tabs globales y de vivienda se ocultan segun los flags activos.
  - Los formularios de alta/edicion de habitaciones muestran precio mensual solo en dormitorios habitables.
  - `Cobros` permite crear facturas puntuales con adjunto, reparto desigual o reparto automatico por centimos, editar facturas emitidas y subir/reemplazar factura original.
  - El inquilino ve el precio de su propia habitacion y enlaces a factura original cuando una deuda procede de un gasto con adjunto.

## Update 2026-04-11 - Pulido de casero y gastos comunes (Epica 15)

- Frontend:
  - `useViviendaIdParam()` fija el `id` de vivienda en tabs anidados del casero y evita que rutas hermanas con `[id]` contaminen el contexto abierto.
  - `casero/vivienda/[id]/(tabs)/opciones.tsx` centraliza la configuracion de modulos de vivienda.
  - `perfil.tsx` muestra `Propietario` para usuarios `CASERO` y elimina el bloque redundante de rol.
  - `inquilino/(tabs)/gastos.tsx` separa pendientes entre companeros y pendientes con casero, elimina textos temporales, muestra estado vacio real y ajusta el FAB para no cubrir contenido.

## Update 2026-04-12 - Epica 16 issue 256

- `docker-compose.yml` deja de fijar la API del frontend a produccion y consume `EXPO_PUBLIC_API_URL` desde `.env`.
- `backend/Dockerfile` queda orientado a Railway: compila con `npm run build` y arranca con `npm start`.
- `docker-compose.yml` mantiene un comando de desarrollo propio para regenerar Prisma Client y arrancar con nodemon solo cuando se use Compose.
- `.env.example`, `backend/.env.example` y `frontend/.env.example` documentan variables obligatorias, opcionales, URLs locales y tokens por entorno.
- `docs/infra/setup-despliegue.md` concentra el flujo Railway desarrollo + Expo Go, Dockerfile, Compose auxiliar y comandos de build/test/lint.

## Update 2026-04-10 - Cobros, mensualidades y push (Epica 12)

- Backend:
  - `GastoRecurrente` soporta mensualidades por vivienda y el cron diario `0 2 * * *` las convierte en gastos repartidos.
  - `Deuda` guarda `justificante_url` y expone `POST /api/deudas/:deudaId/justificante`.
  - `GET /api/viviendas/:viviendaId/cobros` resume cobros del mes actual para el casero.
  - `PATCH /api/usuarios/me/push-token` registra el `expo_push_token` del usuario autenticado.
- Frontend:
  - El casero tiene pestanas globales `Cobros` e `Inventario`.
  - El inquilino tiene pestanas `Limpieza`, `Gastos` e `Inventario`; en `Gastos` puede crear gastos puntuales, saldar deudas y subir justificantes.
  - `app/_layout.tsx`, login, registro y selector de rol sincronizan el push token cuando existe sesion.
- Automatizaciones:
  - El cron `0 12 5 * *` envia recordatorios push de deudas pendientes a usuarios con token Expo registrado.

## Update 2026-04-09 - Inventario Epica 11

- Backend:
  - `ItemInventario` incluye `revisado_por_inquilino`.
  - Inventario expone `POST /api/viviendas/:viviendaId/inventario`, `GET /api/viviendas/:viviendaId/inventario`, `POST /api/inventario/:itemId/fotos` y `PATCH /api/inventario/:itemId/conformidad`.
- Frontend:
  - El casero tiene una pestana `Inventario` para alta de items y subida de fotos.
  - El inquilino tiene una pestana `Inventario` para check-in visual y validacion del estado de cada item.
- UI:
  - `Theme.colors.successLight` y `Theme.colors.dangerLight` se usan para badges de validacion y acciones destructivas suaves.
