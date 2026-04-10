# Setup - Frontend Roomies

## Requisitos

- Node.js 20+
- Expo Go o una build nativa para probar la app
- Cuenta en `expo.dev` si vas a generar builds con EAS

## Variables de entorno

Copia `frontend/.env.example` a `frontend/.env`.

| Entorno | URL |
|---|---|
| Desarrollo | `https://roomies-dev.up.railway.app/api` |
| Produccion | `https://roomies-production-c884.up.railway.app/api` |
| Local | `http://<TU_IP>:3001/api` |

```env
EXPO_PUBLIC_API_URL=https://roomies-dev.up.railway.app/api

EXPO_PUBLIC_MAPBOX_TOKEN=pk.ey...
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web_client_id>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android_client_id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios_client_id>
```

> Las variables `EXPO_PUBLIC_*` se hornean en el bundle. Si cambian, reinicia Metro con `npx expo start --clear`.

## Instalacion y arranque

### Desarrollo local

```bash
cd frontend
npm install
npx expo start
```

### Con Docker Compose

Desde la raiz del repo:

```bash
docker-compose up --build
```

Metro queda accesible para Expo Go en el puerto configurado por el contenedor.

## Estructura real de la app

```text
frontend/
  app/
    _layout.tsx
    index.tsx
    registro.tsx
    rol.tsx
    perfil.tsx
    casero/
      _layout.tsx
      nueva-vivienda.tsx
      (tabs)/
        _layout.tsx
        viviendas.tsx
        cobros.tsx
        inventario.tsx
        tablon.tsx
        perfil.tsx
      vivienda/
        [id]/
          _layout.tsx
          nueva-habitacion.tsx
          editar-habitacion.tsx
          nueva-incidencia.tsx
          (tabs)/
            index.tsx
            incidencias.tsx
            tablon.tsx
            limpieza.tsx
    inquilino/
      _layout.tsx
      nueva-incidencia.tsx
      (tabs)/
        _layout.tsx
        inicio.tsx
        tablon.tsx
        limpieza.tsx
        gastos.tsx
        inventario.tsx
        perfil.tsx
    tablon/
      [viviendaId].tsx
    incidencia/
      [id].tsx
  components/common/
  constants/theme.ts
  services/
    api.ts
    auth.service.ts
  utils/
    notifications.ts
    validaciones.ts
    schemas.ts
  styles/
    casero/
      cobros.styles.ts
      inventario.styles.ts
      nueva-vivienda.styles.ts
      viviendas.styles.ts
    inquilino/
      gastos.styles.ts
      inicio.styles.ts
      inventario.styles.ts
      limpieza.styles.ts
```

## Pantallas implementadas

| Ruta | Archivo | Descripcion |
|---|---|---|
| `/` | `app/index.tsx` | Login con email/password y Google OAuth |
| `/registro` | `app/registro.tsx` | Registro con validacion y Google OAuth |
| `/rol` | `app/rol.tsx` | Selector de rol para usuarios nuevos |
| `/perfil` | `app/perfil.tsx` | Perfil y logout |
| `/casero/viviendas` | `casero/(tabs)/viviendas.tsx` | Lista de viviendas del casero |
| `/casero/cobros` | `casero/(tabs)/cobros.tsx` | Resumen mensual de cobros por vivienda |
| `/casero/inventario` | `casero/(tabs)/inventario.tsx` | Inventario global del casero |
| `/casero/tablon` | `casero/(tabs)/tablon.tsx` | Tablon global del casero |
| `/casero/perfil` | `casero/(tabs)/perfil.tsx` | Perfil del casero |
| `/casero/nueva-vivienda` | `casero/nueva-vivienda.tsx` | Alta de vivienda y habitaciones |
| `/casero/vivienda/:id` | `casero/vivienda/[id]/(tabs)/index.tsx` | Centro de mando de la vivienda |
| `/casero/vivienda/:id/incidencias` | `casero/vivienda/[id]/(tabs)/incidencias.tsx` | Incidencias de la vivienda |
| `/casero/vivienda/:id/tablon` | `casero/vivienda/[id]/(tabs)/tablon.tsx` | Tablon de la vivienda |
| `/casero/vivienda/:id/limpieza` | `casero/vivienda/[id]/(tabs)/limpieza.tsx` | Zonas y turnos de limpieza |
| `/casero/vivienda/:id/nueva-habitacion` | `casero/vivienda/[id]/nueva-habitacion.tsx` | Alta de habitacion |
| `/casero/vivienda/:id/editar-habitacion` | `casero/vivienda/[id]/editar-habitacion.tsx` | Edicion, expulsion y borrado |
| `/casero/vivienda/:id/nueva-incidencia` | `casero/vivienda/[id]/nueva-incidencia.tsx` | Alta de incidencia desde vista casero |
| `/inquilino/inicio` | `inquilino/(tabs)/inicio.tsx` | Onboarding y dashboard del inquilino |
| `/inquilino/tablon` | `inquilino/(tabs)/tablon.tsx` | Tablon del inquilino |
| `/inquilino/limpieza` | `inquilino/(tabs)/limpieza.tsx` | Turno asignado y marcacion como hecho |
| `/inquilino/gastos` | `inquilino/(tabs)/gastos.tsx` | Gastos, deudas, mensualidades y justificantes |
| `/inquilino/inventario` | `inquilino/(tabs)/inventario.tsx` | Revision visual del inventario |
| `/inquilino/perfil` | `inquilino/(tabs)/perfil.tsx` | Perfil del inquilino |
| `/inquilino/nueva-incidencia` | `inquilino/nueva-incidencia.tsx` | Alta de incidencia |
| `/tablon/:viviendaId` | `tablon/[viviendaId].tsx` | Tablon con vivienda explicita |
| `/incidencia/:id` | `incidencia/[id].tsx` | Detalle de incidencia |

## Navegacion

Cada rol tiene su propio grupo `(tabs)`:

| Grupo | Pestanas |
|---|---|
| Casero (global) | Mis viviendas · Cobros · Inventario · Tablon · Perfil |
| Casero (vivienda) | Resumen · Incidencias · Tablon · Limpieza |
| Inquilino | Mi vivienda · Tablon · Limpieza · Gastos · Inventario · Perfil |

Las rutas fuera de tabs se apilan sobre el tab bar gracias a `casero/_layout.tsx` e `inquilino/_layout.tsx`.

## Autenticacion y sesion

El layout raiz (`app/_layout.tsx`) hace tres cosas:

1. Comprueba si existe JWT en `expo-secure-store`.
2. Si hay sesion, llama `GET /auth/me` y redirige al dashboard correcto.
3. Si la sesion existe, lanza `syncPushToken()` para mantener el `expo_push_token` sincronizado con backend.

Flujos principales:

- Login manual: `POST /auth/login`
- Registro manual: `POST /auth/register`
- Google OAuth: `POST /auth/google`
- Selector de rol: `PATCH /auth/rol`
- Perfil autenticado: `GET /auth/me`

## Notificaciones push

La app usa `expo-notifications`.

- `frontend/app.json` incluye el plugin `expo-notifications`.
- El `projectId` de Expo se resuelve desde `expo.extra.eas.projectId`.
- `frontend/utils/notifications.ts` registra el token solo en dispositivo fisico.
- En Expo Go se omite el registro del token porque no soporta este flujo nativo.
- `syncPushToken()` se ejecuta en:
  - `app/_layout.tsx` cuando hay sesion persistida
  - `app/index.tsx` tras login manual o Google
  - `app/registro.tsx` tras registro manual o Google
  - `app/rol.tsx` cuando un alta nueva confirma el rol
- El backend guarda el token con `PATCH /api/usuarios/me/push-token`.

## Flujos destacados de la epica 12

### Cobros del casero

- `casero/(tabs)/cobros.tsx` consulta `GET /api/viviendas/:viviendaId/cobros`.
- La pantalla muestra:
  - selector de vivienda
  - resumen de `pagado` vs `pendiente`
  - listas separadas de deudas pendientes y pagadas
  - modal para ver `justificante_url`

### Gastos del inquilino

- `inquilino/(tabs)/gastos.tsx` combina:
  - `GET /api/viviendas/:viviendaId/gastos`
  - `GET /api/viviendas/:viviendaId/deudas`
  - `GET /api/viviendas/:viviendaId/gastos-recurrentes`
- Permite:
  - crear gastos puntuales
  - crear mensualidades (`POST /api/viviendas/:viviendaId/gastos-recurrentes`)
  - subir justificante (`POST /api/deudas/:deudaId/justificante`)
  - saldar deuda (`PATCH /api/viviendas/:viviendaId/deudas/:deudaId/saldar`)

## Deep linking

`app.json` define `scheme: "roomies"`.

El deep link activo documentado es:

```text
roomies://verificacion?status=success
```

Se usa tras verificar el correo desde backend.

## EAS Build

### Requisitos

- Cuenta en [expo.dev](https://expo.dev)
- `eas-cli` instalado globalmente

```bash
npm install -g eas-cli
```

### Build de prueba Android

```bash
cd frontend
eas login
eas build --platform android --profile preview
```

> Para probar push real necesitas una build nativa o development build; Expo Go no vale.

## Decisiones de arquitectura

| Decision | Motivo |
|---|---|
| `expo-router` | Navegacion por archivos con grupos `(tabs)` y stacks por rol |
| `Theme` centralizado | Tokens consistentes en UI y Soft Tints |
| `services/api.ts` | Un solo cliente Axios con interceptor JWT |
| `auth.service.ts` | Encapsula `SecureStore` y simplifica login/logout |
| `utils/notifications.ts` | Centraliza permisos, obtencion y sincronizacion del Expo Push Token |

## Update 2026-04-10 - Epica 12

- La navegacion del casero ahora incluye `Cobros` e `Inventario` a nivel global.
- La navegacion del inquilino ahora incluye `Limpieza`, `Gastos` e `Inventario`.
- `gastos.tsx` documenta el flujo completo de mensualidades, justificantes y saldado de deuda.
- `app/_layout.tsx` sincroniza el push token al restaurar sesion.
