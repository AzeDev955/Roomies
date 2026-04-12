# Setup - Frontend Roomies

## Requisitos

- Node.js 20+
- Expo Go o una build nativa para probar la app
- Cuenta en `expo.dev` si vas a generar builds con EAS
- Backend desplegado en Railway desarrollo para testeo funcional diario

## Variables de entorno

Copia `frontend/.env.example` a `frontend/.env`.

| Entorno | URL |
|---|---|
| Testeo diario | `https://roomies-dev.up.railway.app/api` |
| Produccion | `https://roomies-production-c884.up.railway.app/api` |
| Local auxiliar | `http://localhost:3001/api` o `http://<TU_IP>:3001/api` |

```env
EXPO_PUBLIC_API_URL=https://roomies-dev.up.railway.app/api

EXPO_PUBLIC_MAPBOX_TOKEN=pk.ey...
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web_client_id>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android_client_id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios_client_id>
```

> Las variables `EXPO_PUBLIC_*` se hornean en el bundle. Si cambian, reinicia Metro con `npx expo start --clear`.

Variables obligatorias para flujos completos:

| Variable | Obligatoria | Uso |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Si | Base URL de la API con sufijo `/api`. |
| `EXPO_PUBLIC_MAPBOX_TOKEN` | Si para crear viviendas con autocompletado | Geocoding de Mapbox. |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Si para Google OAuth | Client ID web compartido con backend. |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Recomendado | Client ID Android para builds nativas. |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Opcional | Client ID iOS si se genera build iOS. |

## Instalacion y testeo con Expo Go

El flujo habitual es levantar solo Expo y consumir Railway desarrollo:

```bash
cd frontend
npm install
npx expo start --clear
```

Abre el QR desde Expo Go. No hace falta levantar backend ni base de datos local para pruebas funcionales habituales.

### Docker Compose auxiliar

Docker Compose no es el flujo habitual de testeo. Si se necesita revisar integracion local de contenedores, desde la raiz del repo:

```bash
docker-compose up --build
```

Metro queda accesible para Expo Go en `http://localhost:8080`. El compose lee `EXPO_PUBLIC_API_URL` desde el `.env` raiz; para un movil fisico debe apuntar al host LAN, por ejemplo `http://192.168.1.50:3001/api`, no a `localhost`.

## Tests y calidad

Frontend usa Jest Expo 54 + React Native Testing Library.

```bash
cd frontend
npm install
npm test
npm run test:watch
npm run test:coverage
npm run lint
```

La configuracion vive en `frontend/package.json` y carga `jest.setup.js`, que define una URL de API local de prueba si `EXPO_PUBLIC_API_URL` no existe. No se necesitan `.env` privados para ejecutar la suite.

La primera prueba renderiza `components/common/CustomButton.tsx` y valida que el handler `onPress` se ejecuta, dejando lista la base para tests de pantallas y flujos de navegacion en issues posteriores.

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
            opciones.tsx
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
  hooks/
    useViviendaIdParam.ts
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
| `/casero/vivienda/:id` | `casero/vivienda/[id]/(tabs)/index.tsx` | Resumen operativo de la vivienda |
| `/casero/vivienda/:id/incidencias` | `casero/vivienda/[id]/(tabs)/incidencias.tsx` | Incidencias de la vivienda |
| `/casero/vivienda/:id/tablon` | `casero/vivienda/[id]/(tabs)/tablon.tsx` | Tablon de la vivienda |
| `/casero/vivienda/:id/limpieza` | `casero/vivienda/[id]/(tabs)/limpieza.tsx` | Zonas y turnos de limpieza |
| `/casero/vivienda/:id/opciones` | `casero/vivienda/[id]/(tabs)/opciones.tsx` | Configuracion de modulos de la vivienda |
| `/casero/vivienda/:id/nueva-habitacion` | `casero/vivienda/[id]/nueva-habitacion.tsx` | Alta de habitacion |
| `/casero/vivienda/:id/editar-habitacion` | `casero/vivienda/[id]/editar-habitacion.tsx` | Edicion, expulsion y borrado |
| `/casero/vivienda/:id/nueva-incidencia` | `casero/vivienda/[id]/nueva-incidencia.tsx` | Alta de incidencia desde vista casero |
| `/inquilino/inicio` | `inquilino/(tabs)/inicio.tsx` | Onboarding y dashboard del inquilino |
| `/inquilino/tablon` | `inquilino/(tabs)/tablon.tsx` | Tablon del inquilino |
| `/inquilino/limpieza` | `inquilino/(tabs)/limpieza.tsx` | Turno asignado y marcacion como hecho |
| `/inquilino/gastos` | `inquilino/(tabs)/gastos.tsx` | Gastos puntuales, deudas, facturas y justificantes |
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
| Casero (vivienda) | Resumen · Incidencias · Tablon · Limpieza · Opciones |
| Inquilino | Mi vivienda · Tablon · Limpieza · Gastos · Inventario · Perfil |

Las rutas fuera de tabs se apilan sobre el tab bar gracias a `casero/_layout.tsx` e `inquilino/_layout.tsx`.

La navegacion es modular por vivienda:

- `mod_limpieza` oculta la tab `Limpieza` en el detalle de vivienda del casero y en el inquilino.
- `mod_gastos` oculta `Gastos` en inquilino y `Cobros` en casero si ninguna vivienda del casero lo tiene activo.
- `mod_inventario` oculta `Inventario` en inquilino y casero si no hay viviendas con el modulo activo.
- El tab `Opciones` (`casero/vivienda/[id]/(tabs)/opciones.tsx`) muestra switches para activar o desactivar modulos via `PATCH /api/viviendas/:id`.
- Los tabs anidados de vivienda usan `useViviendaIdParam()` para leer el id local con fallback al pathname y evitar colisiones con otras rutas dinamicas.

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

## Flujos destacados de las epicas 13 y 14

### Modulos por vivienda

- `casero/vivienda/[id]/(tabs)/opciones.tsx` carga `mod_limpieza`, `mod_gastos` y `mod_inventario` junto con el detalle de vivienda.
- `ModulosViviendaManager` muestra los switches de modulos, hace PATCH parcial con el flag cambiado y actualiza el estado local.
- `utils/viviendaModules.ts` propaga cambios de modulos para que las tabs globales y anidadas se refresquen sin reiniciar la app.
- Las tabs globales del casero (`casero/(tabs)/_layout.tsx`) consultan viviendas y solo muestran `Cobros`/`Inventario` cuando al menos una vivienda tiene el modulo correspondiente activo.
- Las tabs del inquilino (`inquilino/(tabs)/_layout.tsx`) consultan `/inquilino/vivienda` y ocultan `Limpieza`, `Gastos` e `Inventario` segun los flags de su vivienda.

### Precio privado por habitacion

- `casero/nueva-vivienda.tsx`, `casero/vivienda/[id]/nueva-habitacion.tsx` y `casero/vivienda/[id]/editar-habitacion.tsx` muestran el input de precio mensual solo cuando la habitacion es habitable.
- Las tarjetas de habitaciones del casero muestran el precio privado cuando existe.
- `inquilino/(tabs)/inicio.tsx` muestra el precio de la habitacion propia; los companeros llegan desde backend con `precio: null`.
- Si una habitacion se convierte en zona comun, el backend limpia `precio` y el frontend deja de mostrar el campo.

### Facturacion flexible

- `casero/(tabs)/cobros.tsx` permite crear facturas puntuales con concepto, importe, fecha, adjunto opcional y reparto desigual por inquilino activo.
- El reparto se valida en tiempo real en la UI; si todos los importes quedan vacios se calcula un reparto igualitario automatico en centimos, y una cuota `0` cuenta como valor manual valido.
- Las facturas emitidas se agrupan por gasto y pueden editarse desde un modal con concepto, importe y fecha.
- Si alguna deuda hija esta `PAGADA`, el modal deshabilita la edicion del importe y mantiene editables concepto/fecha.
- Desde el modal y desde la tarjeta se puede subir, reemplazar o abrir la factura original (`factura_url`).
- `inquilino/(tabs)/gastos.tsx` muestra "Ver factura original" cuando una deuda procede de un gasto con factura adjunta.

## Flujos destacados de la epica 12

### Cobros del casero

- `casero/(tabs)/cobros.tsx` consulta `GET /api/viviendas/:viviendaId/cobros`.
- La pantalla muestra:
  - selector de vivienda
  - resumen de `pagado` vs `pendiente`
  - listas separadas de deudas pendientes y pagadas
  - modal para ver `justificante_url`
  - facturas emitidas agrupadas por gasto con acciones de editar y ver/subir factura original

### Mensualidades del casero

- `casero/vivienda/[id]/(tabs)/index.tsx` lista y crea gastos fijos de la vivienda con `GET/POST /api/viviendas/:viviendaId/gastos-recurrentes`.
- El alta de mensualidad vive en el contexto de una vivienda concreta para que el backend pueda validar al casero propietario.
- El inquilino no carga ni crea mensualidades recurrentes desde su tab de gastos.

### Gastos del inquilino

- `inquilino/(tabs)/gastos.tsx` combina:
  - `GET /api/viviendas/:viviendaId/gastos`
  - `GET /api/viviendas/:viviendaId/deudas`
- Permite:
  - crear gastos puntuales
  - subir justificante (`POST /api/deudas/:deudaId/justificante`)
  - saldar deuda (`PATCH /api/viviendas/:viviendaId/deudas/:deudaId/saldar`)
  - abrir la factura original (`factura_url`) cuando existe
- La pantalla separa visualmente los pendientes entre companeros de los pendientes con el casero y muestra un estado vacio cuando no hay deudas reales pendientes.

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
| `docs/frontend/visual-quality.md` | Reglas obligatorias para tokens, accesibilidad, copy y mojibake en futuras PRs |
| `services/api.ts` | Un solo cliente Axios con interceptor JWT |
| `auth.service.ts` | Encapsula `SecureStore` y simplifica login/logout |
| `utils/notifications.ts` | Centraliza permisos, obtencion y sincronizacion del Expo Push Token |
| `hooks/useViviendaIdParam.ts` | Aisla el id de vivienda en tabs anidados del casero con fallback al pathname |

## Update 2026-04-10 - Epica 12

- La navegacion del casero ahora incluye `Cobros` e `Inventario` a nivel global.
- La navegacion del inquilino ahora incluye `Limpieza`, `Gastos` e `Inventario`.
- `gastos.tsx` documenta el flujo de gastos puntuales, justificantes, facturas originales y saldado de deuda.
- `app/_layout.tsx` sincroniza el push token al restaurar sesion.

## Update 2026-04-10 - Epicas 13 y 14

- La navegacion de casero e inquilino se adapta a `mod_limpieza`, `mod_gastos` y `mod_inventario`.
- El tab `Opciones` de vivienda permite configurar modulos con switches persistidos por API.
- Alta y edicion de habitaciones soportan precio mensual privado para dormitorios habitables.
- `Cobros` permite crear facturas puntuales con reparto desigual o automatico por centimos, editar facturas ya emitidas y gestionar `factura_url`.
- `Gastos` del inquilino muestra enlaces a factura original cuando existen.

## Update 2026-04-11 - Epica 15

- Los tabs internos de vivienda usan `useViviendaIdParam()` para evitar que rutas hermanas con `[id]` cambien el contexto de la vivienda abierta.
- El perfil compartido muestra `Propietario` para caseros y elimina la tarjeta redundante de rol.
- `Gastos` del inquilino separa pendientes entre companeros y con casero, elimina copy temporal, muestra estado vacio real y sube el FAB para no tapar contenido.

## Update 2026-04-11 - Epica 16 issue 246

- Se anade Jest Expo 54 + React Native Testing Library.
- `package.json` incorpora `test`, `test:watch` y `test:coverage`.
- `react-test-renderer` queda fijado en `19.1.0` para coincidir exactamente con React.

## Update 2026-04-12 - Epica 16 issue 255

- Se documentan los criterios obligatorios de calidad visual, accesibilidad, copy y encoding en `docs/frontend/visual-quality.md`.
- Los colores semanticos compartidos quedan centralizados en `Theme.colors` para evitar hexadecimales locales.
- Los componentes comunes y pantallas de autenticacion declaran roles, labels y estados accesibles en acciones principales.
