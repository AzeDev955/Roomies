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
| Auth social     | `expo-auth-session/providers/google` + `expo-web-browser`            |
| Infraestructura | Docker Compose (PostgreSQL + backend + frontend)                     |

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
│   │   │   └── vivienda/
│   │   │       └── [id]/               ← Stack externo que aloja tabs + modales de habitación
│   │   │           ├── _layout.tsx     ← Stack sin header (permite apilar modales sobre las tabs)
│   │   │           ├── nueva-habitacion.tsx
│   │   │           ├── editar-habitacion.tsx
│   │   │           └── (tabs)/         ← Tabs anidadas: centro de mandos de la vivienda
│   │   │               ├── _layout.tsx ← Tab bar vivienda + botón ← en headerLeft
│   │   │               ├── index.tsx   ← Resumen: habitaciones, inquilinos, códigos
│   │   │               ├── incidencias.tsx ← incidencias de la vivienda
│   │   │               └── tablon.tsx  ← tablón de anuncios de esta vivienda
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
│   │   │   ├── inicio.styles.ts            ← incluye COLORES_PRIORIDAD
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
| `dni`           | String? unique | obligatorio en registro manual                |
| `email`         | String unique  |                                               |
| `password_hash` | String?        | null si el usuario se registró con Google     |
| `google_id`     | String? unique | null si el usuario se registró con email/pass |
| `telefono`      | String?        | obligatorio en registro manual                |
| `rol`           | RolUsuario     | `CASERO` \| `INQUILINO`                       |

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

---

## API REST (base: `/api`)

### Auth — `/auth`

| Método | Ruta             | Auth | Descripción                                                                                           |
| ------ | ---------------- | ---- | ----------------------------------------------------------------------------------------------------- |
| POST   | `/auth/register` | No   | Registro con email/pass. Campos: `nombre`, `apellidos`, `dni`, `email`, `telefono`, `password`, `rol` |
| POST   | `/auth/login`    | No   | Login con email/pass                                                                                  |
| POST   | `/auth/google`   | No   | Login/registro con Google. Body: `{ idToken }`. Devuelve `esNuevo: boolean`                           |
| GET    | `/auth/me`       | Sí   | Perfil del usuario autenticado                                                                        |
| PATCH  | `/auth/rol`      | Sí   | Actualiza el rol del usuario y re-emite el JWT. Body: `{ rol: "CASERO" \| "INQUILINO" }`              |

### Viviendas — `/viviendas`

| Método | Ruta                                           | Auth | Descripción                                                                |
| ------ | ---------------------------------------------- | ---- | -------------------------------------------------------------------------- |
| GET    | `/viviendas`                                   | Sí   | Lista viviendas del casero autenticado                                     |
| POST   | `/viviendas`                                   | Sí   | Crea vivienda (acepta array opcional `habitaciones`)                       |
| GET    | `/viviendas/:id`                               | Sí   | Detalle con habitaciones e inquilinos                                      |
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
```

### `frontend/.env` (leído por Metro en tiempo de compilación)

```
EXPO_PUBLIC_API_URL=http://<HOST_IP>:3001/api
EXPO_PUBLIC_MAPBOX_TOKEN=<token Mapbox>
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<Web Client ID>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<Android Client ID o vacío>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<iOS Client ID o vacío>
```

> Las variables `EXPO_PUBLIC_*` se hornean en el bundle de Metro. Cambiarlas requiere reiniciar Metro con `--clear`.

---

## Docker

```bash
# Primera vez o tras cambios en dependencias
docker-compose down -v
docker-compose build --no-cache backend
docker-compose up

# Uso habitual
docker-compose up
docker-compose down
```

El backend en Docker ejecuta al arrancar:

1. `npx prisma db push --accept-data-loss` — aplica el schema
2. `npx prisma generate` — regenera el cliente
3. `npx prisma db seed` — carga datos de prueba
4. `npm run dev` — arranca el servidor con nodemon

**Puertos**: PostgreSQL en `5433:5432`, backend en `3001:3000`, frontend en `8080:8080`.

> El puerto 8080 se usa en lugar de 8081 para evitar conflictos con reglas de firewall de Windows.

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
- **Design tokens**: usar `Theme` de `constants/theme.ts` para todos los valores de color, spacing, radius y tipografía. Nunca hex literals ni magic numbers en estilos.
- **Navegación**: usar `router.replace()` (de `expo-router`) para navegar entre sesiones (login → dashboard, logout → index, selector de rol → dashboard). Nunca `CommonActions.reset` de React Navigation — no resuelve los grupos `(tabs)` de Expo Router.
- **Token**: guardar/recuperar/eliminar con las funciones de `services/auth.service.ts`.
- **API**: importar la instancia Axios de `@/services/api`. El interceptor inyecta el Bearer token automáticamente.
- **Variables de entorno**: solo `EXPO_PUBLIC_*` son accesibles en el frontend. Se leen con `process.env.EXPO_PUBLIC_*`.
- **Autocompletado de habitaciones**: al seleccionar tipo BANO, COCINA o SALON en los formularios de habitación, el campo nombre se rellena automáticamente con el nombre canónico. Sigue siendo editable.
- **Portapapeles y códigos**: los códigos se almacenan con prefijo `ROOM-` en la BD, pero al copiar al portapapeles se limpia el prefijo con `/^room[-\s]*/i` para que el inquilino solo pegue la parte alfanumérica.

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
   - Sección "Compañeros de piso": dormitorios con inquilino asignado (excepto el propio).
   - Sección "Zonas comunes": habitaciones que no son DORMITORIO.
   - Sección "Incidencias": `GET /incidencias` filtra por la vivienda del inquilino.
4. Puede crear incidencias desde `inquilino/nueva-incidencia`:
   - Selector de habitación filtrado: solo zonas comunes + propia habitación.
   - `habitacion_id` es opcional en el POST — si se envía y apunta a un dormitorio ajeno, el backend devuelve 403.
   - En el dashboard, cada tarjeta de incidencia muestra un selector de estado (3 pills: Pendiente / En proceso / Resuelta) si el inquilino tiene permiso, o el estado como texto de solo lectura si no. Permisos: es creador **o** la incidencia está en su dormitorio **o** está en una zona común.
5. **Ciclo de vida**:
   - El inquilino puede abandonar su habitación: botón "Abandonar Vivienda" (outline rojo) al final del dashboard → `DELETE /inquilino/habitacion` → la pantalla regresa al onboarding de forma inmediata (reset de estado local, sin navegación).
   - El casero puede expulsar a un inquilino: botón "Expulsar" dentro de la tarjeta de habitación ocupada → `DELETE /viviendas/:id/habitaciones/:habId/inquilino` → la tarjeta se actualiza de forma reactiva sin recargar la pantalla.
   - Eliminar la habitación en sí sigue fallando (400) si aún tiene inquilino asignado.

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
