# Roomies — Contexto del proyecto

> Documento de referencia para agentes e IA. Describe la arquitectura, convenciones y estado actual del proyecto. Actualizar cuando cambie algo relevante.

---

## ¿Qué es Roomies?

Aplicación móvil de gestión de pisos compartidos. Hay dos roles:

- **Casero**: crea viviendas y habitaciones, gestiona inquilinos e incidencias.
- **Inquilino**: se une a una habitación mediante un código de invitación, reporta incidencias.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express 5 + TypeScript |
| ORM | Prisma 7 (PostgreSQL) |
| Auth | JWT (`jsonwebtoken`) + bcrypt + Google OAuth (`google-auth-library`) |
| Frontend | React Native + Expo (SDK 54) |
| Routing | `expo-router` ~6.0.23 (file-based) |
| HTTP client | Axios con interceptor Bearer token |
| Token storage | `expo-secure-store` |
| Geocoding | Mapbox Geocoding API |
| Auth social | `expo-auth-session/providers/google` + `expo-web-browser` |
| Infraestructura | Docker Compose (PostgreSQL + backend + frontend) |

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
│   │   │   ├── auth.controller.ts
│   │   │   └── vivienda.controller.ts
│   │   ├── generated/prisma/   ← cliente Prisma generado (no editar)
│   │   ├── lib/prisma.ts       ← instancia singleton de PrismaClient
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts  ← verificarToken
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── vivienda.routes.ts
│   │   ├── utils/
│   │   │   └── generarCodigo.ts    ← generarCodigoInvitacion()
│   │   └── index.ts            ← entry point Express
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx         ← layout raíz con tab navigator
│   │   ├── index.tsx           ← Login
│   │   ├── registro.tsx        ← Registro
│   │   ├── perfil.tsx          ← Perfil + logout
│   │   ├── home.tsx
│   │   ├── casero/
│   │   │   ├── viviendas.tsx           ← lista de viviendas del casero
│   │   │   ├── nueva-vivienda.tsx      ← crear vivienda (con habitaciones inline)
│   │   │   └── vivienda/
│   │   │       ├── [id].tsx            ← detalle vivienda + habitaciones
│   │   │       └── [id]/
│   │   │           ├── nueva-habitacion.tsx
│   │   │           └── editar-habitacion.tsx
│   │   └── inquilino/
│   │       ├── inicio.tsx              ← dashboard inquilino
│   │       └── nueva-incidencia.tsx
│   ├── services/
│   │   ├── api.ts              ← instancia Axios con baseURL + interceptor
│   │   └── auth.service.ts     ← guardarToken / obtenerToken / eliminarToken
│   ├── styles/                 ← un .styles.ts por pantalla, nunca inline
│   │   ├── index.styles.ts
│   │   ├── registro.styles.ts
│   │   ├── perfil.styles.ts
│   │   └── casero/
│   │       ├── nueva-vivienda.styles.ts
│   │       └── vivienda/
│   │           ├── detalle.styles.ts
│   │           └── nueva-habitacion.styles.ts
│   ├── frontend/.env           ← variables EXPO_PUBLIC_* (baked en Metro)
│   └── package.json
├── docs/
│   ├── backend/api.md          ← documentación de endpoints REST
│   └── changelog/              ← un .md por issue implementado
├── .env                        ← variables raíz (Docker Compose las lee)
├── docker-compose.yml
└── CONTEXT.md                  ← este archivo
```

---

## Modelos de datos (Prisma)

### `Usuario`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | autoincrement |
| `nombre` | String | obligatorio |
| `apellidos` | String? | opcional (OAuth no siempre lo provee) |
| `dni` | String? unique | obligatorio en registro manual |
| `email` | String unique | |
| `password_hash` | String? | null si el usuario se registró con Google |
| `google_id` | String? unique | null si el usuario se registró con email/pass |
| `telefono` | String? | obligatorio en registro manual |
| `rol` | RolUsuario | `CASERO` \| `INQUILINO` |

### `Vivienda`
| Campo | Tipo |
|---|---|
| `id` | Int PK |
| `casero_id` | FK → Usuario |
| `alias_nombre` | String |
| `direccion` | String |
| `codigo_postal` | String |
| `ciudad` | String |
| `provincia` | String |

### `Habitacion`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | |
| `vivienda_id` | FK → Vivienda | |
| `inquilino_id` | FK → Usuario? | null si sin inquilino |
| `nombre` | String | |
| `tipo` | TipoHabitacion | `DORMITORIO` \| `BANO` \| `COCINA` \| `SALON` \| `OTRO` |
| `es_habitable` | Boolean | si true, tiene código de invitación |
| `metros_cuadrados` | Float? | |
| `codigo_invitacion` | String? unique | se genera con `generarCodigoInvitacion()` |

### `Incidencia`
| Campo | Tipo |
|---|---|
| `id` | Int PK |
| `vivienda_id` | FK → Vivienda |
| `creador_id` | FK → Usuario |
| `titulo` | String |
| `descripcion` | String |
| `estado` | `PENDIENTE` \| `EN_PROCESO` \| `RESUELTA` |
| `prioridad` | `VERDE` \| `AMARILLO` \| `ROJO` |
| `fecha_creacion` | DateTime |

---

## API REST (base: `/api`)

### Auth — `/auth`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | No | Registro con email/pass. Campos: `nombre`, `apellidos`, `dni`, `email`, `telefono`, `password`, `rol` |
| POST | `/auth/login` | No | Login con email/pass |
| POST | `/auth/google` | No | Login/registro con Google. Body: `{ idToken }` |
| GET | `/auth/me` | Sí | Perfil del usuario autenticado |

### Viviendas — `/viviendas`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/viviendas` | Sí | Lista viviendas del casero autenticado |
| POST | `/viviendas` | Sí | Crea vivienda (acepta array opcional `habitaciones`) |
| GET | `/viviendas/:id` | Sí | Detalle con habitaciones e inquilinos |
| POST | `/viviendas/:id/habitaciones` | Sí | Añade habitación suelta |
| PUT | `/viviendas/:id/habitaciones/:habId` | Sí | Edita habitación |
| DELETE | `/viviendas/:id/habitaciones/:habId` | Sí | Elimina habitación (falla si tiene inquilino) |

### Inquilino (sin prefijo de grupo documentado aún)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/inquilino/unirse` | Sí | Canjear código de invitación |
| GET | `/inquilino/habitacion` | Sí | Habitación actual del inquilino |
| POST | `/incidencias` | Sí | Crear incidencia |
| GET | `/incidencias` | Sí | Listar incidencias |
| PATCH | `/incidencias/:id/estado` | Sí | Cambiar estado |

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

**Puertos**: PostgreSQL en `5433:5432`, backend en `3001:3000`, frontend en `8081:8081`.

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
- **Navegación**: usar `CommonActions.reset` (de `@react-navigation/native`) para limpiar la pila al hacer login/logout. Nunca `router.replace` para navegaciones entre sesiones.
- **Token**: guardar/recuperar/eliminar con las funciones de `services/auth.service.ts`.
- **API**: importar la instancia Axios de `@/services/api`. El interceptor inyecta el Bearer token automáticamente.
- **Variables de entorno**: solo `EXPO_PUBLIC_*` son accesibles en el frontend. Se leen con `process.env.EXPO_PUBLIC_*`.

### Routing (expo-router)
- Las rutas de archivo se mapean directamente a URLs.
- `[id].tsx` → pantalla de detalle con param `id`.
- `[id]/nueva-habitacion.tsx` → subruta con acceso a `id` mediante `useLocalSearchParams`.
- Los tabs del layout raíz (`_layout.tsx`) son: `casero/viviendas`, `inquilino/inicio`, `perfil`.

---

## Flujo de autenticación

1. **Registro manual**: `POST /auth/register` → devuelve nada (201). El usuario va al login.
2. **Login manual**: `POST /auth/login` → devuelve `{ token, usuario }`. Se guarda el token con `guardarToken`. Se navega con `CommonActions.reset`.
3. **Google OAuth**: `expo-auth-session` obtiene un `idToken` en el dispositivo → se envía a `POST /auth/google` → el backend lo verifica con `google-auth-library` → upsert del usuario → devuelve `{ token, usuario }`.
4. **Sesión**: el token JWT se almacena en `expo-secure-store`. El interceptor de Axios lo inyecta en cada petición.
5. **Logout**: `eliminarToken()` + `CommonActions.reset` a `index`.

---

## Flujo del inquilino

1. Recibe un código de invitación del casero.
2. `POST /inquilino/unirse` con el código → queda asignado a la habitación.
3. Accede al dashboard `inquilino/inicio` con info de su habitación.
4. Puede crear incidencias desde `inquilino/nueva-incidencia`.

---

## Seed de desarrollo

Usuarios de prueba creados por `prisma db seed`:

| Email | Password | Rol |
|---|---|---|
| casero@test.com | `password123` | CASERO |
| inquilino@test.com | `password123` | INQUILINO |

---

## Documentación adicional

- `docs/backend/api.md` — referencia completa de endpoints con ejemplos de body/response.
- `docs/changelog/` — un archivo por issue implementado, con decisiones técnicas.
