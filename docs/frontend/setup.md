# Setup — Frontend Roomies

## Requisitos

- Node.js 20+
- Expo Go en el móvil (iOS / Android), o un emulador Android/iOS

## Variables de entorno

Crea un archivo `frontend/.env` (no lo subas al repositorio):

```env
EXPO_PUBLIC_API_URL=http://192.168.1.X:3001/api
EXPO_PUBLIC_MAPBOX_TOKEN=<tu_token_mapbox>
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web_client_id>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android_client_id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios_client_id>
```

> `EXPO_PUBLIC_API_URL`: IP de tu máquina en la red Wi-Fi local (`ipconfig` → IPv4 del adaptador Wi-Fi). Si arrancas sin Docker, apunta a `http://localhost:3000/api`. Si el backend está desplegado en Railway, usa la URL pública: `https://<dominio>.up.railway.app/api`.
> `EXPO_PUBLIC_MAPBOX_TOKEN`: necesario para el autocompletado de dirección en "Nueva vivienda".
> `EXPO_PUBLIC_GOOGLE_*`: IDs de credenciales OAuth 2.0 de Google Cloud Console. Ver sección [Autenticación Google OAuth](#autenticación-google-oauth).

Las variables `EXPO_PUBLIC_*` se hornean en el bundle en tiempo de compilación por Metro — cualquier cambio requiere reiniciar Metro con `npx expo start --clear`.

## Instalación y arranque

### Desarrollo local (sin Docker)

```bash
cd frontend
npm install
npx expo start
```

Escanea el QR con Expo Go o pulsa `a` (Android) / `i` (iOS) para abrir el emulador.

### Con Docker Compose (recomendado)

Desde la raíz del repositorio:

```bash
docker-compose up --build
```

El servicio `frontend` arranca en el puerto `8081`. Metro Bundler anuncia la IP configurada en `HOST_IP` del `.env` raíz para que Expo Go en el móvil pueda conectar.

## Estructura de la app

```
frontend/
  app/
    _layout.tsx                               # Layout raíz — guard de sesión + Stack navigator
    index.tsx                                 # Login — email/password + Google OAuth
    registro.tsx                              # Registro — formulario completo + Google OAuth
    perfil.tsx                                # Perfil del usuario + botón Cerrar Sesión (compartido entre roles)
    rol.tsx                                   # Selector de rol post-OAuth (usuarios nuevos)
    casero/
      _layout.tsx                             # Stack del casero (apila pantallas sobre el tab bar)
      nueva-vivienda.tsx                      # Formulario crear vivienda + habitaciones inline + Mapbox
      (tabs)/
        _layout.tsx                           # Tab bar del casero: Mis viviendas | Tablón | Perfil
        viviendas.tsx                         # Lista de viviendas (GET /viviendas)
        tablon.tsx                            # Tablón del casero — auto-fetch viviendaId
        perfil.tsx                            # Re-export de app/perfil.tsx
      vivienda/
        [id].tsx                              # Detalle: habitaciones + inquilinos + biometría + editar/eliminar
        [id]/
          nueva-habitacion.tsx                # Crear habitación con autocompletado de nombre
          editar-habitacion.tsx               # Editar habitación (PUT /viviendas/:id/habitaciones/:habId)
          incidencias.tsx                     # Lista de incidencias de la vivienda (vista casero)
    inquilino/
      _layout.tsx                             # Stack del inquilino
      nueva-incidencia.tsx                    # Formulario nueva incidencia con selector de habitación
      (tabs)/
        _layout.tsx                           # Tab bar del inquilino: Mi vivienda | Tablón | Perfil
        inicio.tsx                            # Onboarding (canjear código) + Dashboard (compañeros, zonas, incidencias)
        tablon.tsx                            # Tablón del inquilino — auto-fetch viviendaId
        perfil.tsx                            # Re-export de app/perfil.tsx
    tablon/
      [viviendaId].tsx                        # Tablón con viviendaId en URL (acceso directo desde otras pantallas)
    incidencia/
      [id].tsx                                # Detalle de incidencia — edición inline para casero
  components/
    common/
      CustomButton.tsx                        # Botón reutilizable: primary | secondary | outline | danger | success
      CustomButton.styles.ts
      Card.tsx                                # Contenedor con sombra; Pressable si recibe onPress, View si no
      Card.styles.ts
      CustomInput.tsx                         # Input con label, foco, error y secureToggle integrado
      CustomInput.styles.ts
  services/
    api.ts                                    # Instancia Axios centralizada con interceptor JWT
    auth.service.ts                           # guardarToken / obtenerToken / eliminarToken (SecureStore)
  utils/
    validaciones.ts                           # Funciones puras standalone: validarDniNie, validarPasaporte, validarPassword
    schemas.ts                                # Esquemas Zod: dniNieSchema, pasaporteSchema, passwordSchema
  styles/
    index.styles.ts
    registro.styles.ts
    perfil.styles.ts
    rol.styles.ts
    home.styles.ts
    casero/
      viviendas.styles.ts
      nueva-vivienda.styles.ts
      vivienda/
        detalle.styles.ts
        incidencias.styles.ts
        nueva-habitacion.styles.ts
    inquilino/
      inicio.styles.ts
      nueva-incidencia.styles.ts
    incidencia/
      detalle.styles.ts
    tablon/
      tablon.styles.ts
  constants/
    theme.ts                                  # Design tokens: colors, spacing, radius, typography
```

## Pantallas implementadas

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `app/index.tsx` | Login — POST `/auth/login` + Google OAuth |
| `/registro` | `app/registro.tsx` | Registro — POST `/auth/register` + Google OAuth. Selector chips DNI/NIE \| Pasaporte, validación Zod inline. |
| `/rol` | `app/rol.tsx` | Selector de rol post-OAuth (usuarios nuevos) |
| `/perfil` | `app/perfil.tsx` | GET `/auth/me` + logout |
| `/casero/viviendas` | `casero/(tabs)/viviendas.tsx` | Lista viviendas del casero |
| `/casero/tablon` | `casero/(tabs)/tablon.tsx` | Tablón del casero (auto-fetch viviendaId) |
| `/casero/perfil` | `casero/(tabs)/perfil.tsx` | Perfil (tab del casero) |
| `/casero/nueva-vivienda` | `casero/nueva-vivienda.tsx` | Crear vivienda + habitaciones + Mapbox |
| `/casero/vivienda/:id` | `casero/vivienda/[id].tsx` | Detalle vivienda + inquilinos + biometría |
| `/casero/vivienda/:id/nueva-habitacion` | `casero/vivienda/[id]/nueva-habitacion.tsx` | Crear habitación |
| `/casero/vivienda/:id/editar-habitacion` | `casero/vivienda/[id]/editar-habitacion.tsx` | Editar habitación |
| `/casero/vivienda/:id/incidencias` | `casero/vivienda/[id]/incidencias.tsx` | Incidencias de la vivienda |
| `/inquilino/inicio` | `inquilino/(tabs)/inicio.tsx` | Onboarding + Dashboard inquilino |
| `/inquilino/tablon` | `inquilino/(tabs)/tablon.tsx` | Tablón del inquilino (auto-fetch viviendaId) |
| `/inquilino/perfil` | `inquilino/(tabs)/perfil.tsx` | Perfil (tab del inquilino) |
| `/inquilino/nueva-incidencia` | `inquilino/nueva-incidencia.tsx` | Crear incidencia |
| `/tablon/:viviendaId` | `tablon/[viviendaId].tsx` | Tablón con viviendaId explícito en URL |
| `/incidencia/:id` | `incidencia/[id].tsx` | Detalle de incidencia |

## Arquitectura de navegación

### Bottom Tab Navigation (Expo Router `(tabs)`)

Cada rol tiene su propio grupo `(tabs)` con tres pestañas:

| Rol | Pestañas |
|---|---|
| Casero | Mis viviendas · Tablón · Perfil |
| Inquilino | Mi vivienda · Tablón · Perfil |

El grupo `(tabs)` es transparente en URLs: `/casero/viviendas` resuelve a `casero/(tabs)/viviendas.tsx`. Las rutas que no son tabs (detalle de vivienda, nueva vivienda, nueva incidencia, detalle de incidencia) se apilan sobre el tab bar gracias al `Stack` en `casero/_layout.tsx` e `inquilino/_layout.tsx`.

### Guard de sesión en `_layout.tsx`

Al montar la app, el layout raíz verifica automáticamente si existe un JWT válido:

1. Lee el token con `obtenerToken()` (SecureStore)
2. Si hay token, llama `GET /auth/me` para obtener el rol
3. Redirige con `router.replace()` al dashboard correspondiente
4. Si el token es inválido o expirado lo borra con `eliminarToken()` y deja al usuario en el login
5. Mientras verifica, muestra un `ActivityIndicator` como overlay

```tsx
// app/_layout.tsx
useEffect(() => {
  const verificarSesion = async () => {
    const token = await obtenerToken();
    if (token) {
      const { data } = await api.get<{ rol: string }>('/auth/me');
      const destino = data.rol === 'CASERO' ? '/casero/viviendas' : '/inquilino/inicio';
      router.replace(destino);
    }
  };
  verificarSesion().finally(() => setChecking(false));
}, []);
```

## Arquitectura de autenticación

### Flujo email/password

1. Login en `/` → `POST /auth/login` → recibe `token` JWT
2. `guardarToken(token)` lo persiste en `expo-secure-store`
3. Todas las peticiones llevan `Authorization: Bearer <token>` inyectado automáticamente por el interceptor de `services/api.ts`

### Interceptor Axios (`services/api.ts`)

```typescript
api.interceptors.request.use(async (config) => {
  const token = await obtenerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Autenticación Google OAuth

1. El usuario pulsa "Continuar con Google" → `expo-auth-session` abre el navegador embebido
2. Google redirige de vuelta con un `idToken`
3. El frontend envía el `idToken` al backend (`POST /auth/google`)
4. El backend lo verifica con `OAuth2Client.verifyIdToken()` y devuelve el JWT propio
5. El JWT se persiste igual que en el flujo email/password

**Configuración necesaria:**
- Credencial **Web** en Google Cloud Console — añadir `https://auth.expo.io/@<usuario>/frontend` como URI de redirección autorizada
- Credencial **Android** (package `host.exp.exponent`, SHA-1 del debug keystore de Expo)
- Credencial **iOS** (bundle ID de la app)
- Copiar los Client IDs en `frontend/.env` y el Web Client ID en `backend/.env` (`GOOGLE_CLIENT_ID`)

### Códigos de invitación (biometría)

La pantalla de detalle de vivienda protege los códigos con `expo-local-authentication`. Estado `Record<number, boolean>` independiente por ID — revelar un código no afecta al resto. Al copiar se elimina el prefijo `ROOM-` automáticamente.

## Sistema de diseño

### Design tokens (`constants/theme.ts`)

Fuente única de verdad para todos los estilos. Exporta el objeto `Theme` con `as const`:

```typescript
Theme.colors.primary        // '#007AFF'
Theme.spacing.base          // 16
Theme.radius.md             // 12
Theme.typography.body       // 15
```

Categorías: `colors` (16 tokens) · `spacing` (xs→xl) · `radius` (sm→full) · `typography` (caption→hero)

### Componentes base (`components/common/`)

| Componente | Props clave | Uso |
|---|---|---|
| `CustomButton` | `label`, `variant`, `disabled`, `loading` | Reemplaza todos los `Pressable`-botón con estilos inline |
| `Card` | `children`, `onPress?` | Contenedor con sombra; `Pressable` si recibe `onPress`, `View` si no |
| `CustomInput` | `label`, `error?`, `secureToggle?` | Input con label en uppercase, borde focus/error, toggle de contraseña integrado |

### Validaciones (`utils/`)

| Archivo | Exports | Descripción |
|---|---|---|
| `validaciones.ts` | `validarDniNie`, `validarPasaporte`, `validarPassword` | Funciones puras sin dependencias externas. Útiles para lógica fuera de formularios. |
| `schemas.ts` | `dniNieSchema`, `pasaporteSchema`, `passwordSchema` | Esquemas Zod reutilizables. Usar `.safeParse()` para obtener errores tipados con mensaje. |

`dniNieSchema` aplica el algoritmo módulo 23 oficial (DNI de 8 dígitos + NIE X/Y/Z). `passwordSchema` encadena `.min(8)` + dos `.regex()` con mensajes independientes — `safeParse` devuelve el primer fallo encontrado.

Variantes de `CustomButton`: `primary` · `secondary` · `outline` · `danger` · `success`

## Convenciones

### Estilos modulares

Los estilos viven en `styles/` (fuera de `app/`), espejando la misma estructura de carpetas. Expo Router trata **todos** los archivos de `app/` como rutas — los `.styles.ts` dentro de `app/` generarían warnings.

```
app/casero/vivienda/[id].tsx              # Solo lógica y JSX
styles/casero/vivienda/detalle.styles.ts  # Solo StyleSheet.create + export { styles }
```

### Alias `@/`

Las pantallas usan `@/` para importar sin rutas relativas largas:

```tsx
import { styles } from '@/styles/casero/vivienda/detalle.styles';
import { CustomButton } from '@/components/common/CustomButton';
import { Theme } from '@/constants/theme';
import api from '@/services/api';
```

`@/` apunta a la raíz de `frontend/` y está configurado en `tsconfig.json`.

### Recarga automática con `useFocusEffect`

Las pantallas que listan datos usan `useFocusEffect` + `useCallback` para recargar al volver de pantallas de formulario, sin prop drilling ni contexto global.

```tsx
useFocusEffect(useCallback(() => { cargarDatos(); }, [id]));
```

## Generar APK para testing (EAS Build)

### Requisitos

- Cuenta en [expo.dev](https://expo.dev) (el `owner` en `app.json` es `azeron955`)
- EAS CLI instalado globalmente: `npm install -g eas-cli`

### Configuración existente (`frontend/eas.json`)

```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://roomies-production-c884.up.railway.app/api",
        "EXPO_PUBLIC_GOOGLE_CLIENT_ID": "...",
        "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID": "..."
      }
    },
    "production": { "android": { "buildType": "app-bundle" } }
  }
}
```

> Las variables `EXPO_PUBLIC_*` deben declararse en `eas.json` bajo `env` del perfil porque el cloud builder de EAS **no lee el `.env` local**.

### Comandos

```bash
cd frontend
eas login           # una sola vez
eas build --platform android --profile preview
```

### Instalar en dispositivo vía ADB

```bash
adb uninstall com.azeron955.roomies   # evita conflictos de firma
adb install ruta/al/build.apk
```

### Google OAuth en APK nativo

El `androidClientId` configurado usa el paquete `host.exp.exponent` (Expo Go). Para que funcione en el APK nativo (`com.azeron955.roomies`):

1. Crear credencial **Android** en Google Cloud Console con `com.azeron955.roomies` y el SHA-1 que genera EAS (`eas credentials`)
2. Actualizar `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` en `eas.json`

Mientras tanto, el **login con email/contraseña funciona correctamente** en el APK.

### Ver logs de crash

```bash
adb logcat -s ReactNativeJS AndroidRuntime
```

---

## Decisiones de arquitectura

| Decisión | Motivo |
|---|---|
| Expo Router file-based routing | Rutas declarativas por nombre de archivo; estándar moderno de Expo |
| Grupo `(tabs)` por rol | Cada rol tiene su propio tab bar sin compartir estado de navegación |
| Stack sobre tabs (`casero/_layout`, `inquilino/_layout`) | Pantallas de formulario/detalle se apilan sobre el tab bar sin ocultarlo bruscamente |
| Guard de sesión en `_layout.tsx` | Un solo punto de verificación; ninguna pantalla protegida necesita lógica propia de auth |
| `router.replace()` en vez de `CommonActions.reset()` | `CommonActions.reset` usa nombres internos de React Navigation que no resuelven grupos `(tabs)` de Expo Router |
| Design tokens `as const` | TypeScript infiere tipos literales; cambiar un color global requiere editar una sola línea |
| Componentes base en `components/common/` | Elimina ~120 líneas de estilos duplicados; consistencia visual garantizada |
| `styles/` fuera de `app/` | Expo Router trata todo `app/` como rutas — los `.styles.ts` causarían warnings |
| `@/` alias para imports | Evita `../../../../` en rutas anidadas |
| `Pressable` en lugar de `Button` | Mayor control de estilos; `Button` nativo depende de la plataforma |
| `expo-secure-store` para el JWT | Almacenamiento cifrado en el dispositivo; más seguro que AsyncStorage |
| Instancia Axios centralizada | Un único punto de configuración del interceptor JWT |
| `useFocusEffect` en lugar de `useEffect` | Recarga datos al volver de pantallas de formulario sin estados globales |
| Tablón como tab autónomo | Obtiene `viviendaId` vía API en lugar de recibirlo por URL — permite acceso directo desde el tab bar |
| Auth biométrica por habitación | Estado `Record<number, boolean>` independiente — revelar un código no afecta al resto |
| Google OAuth via backend verification | El `idToken` siempre se verifica en el servidor — el frontend nunca decide si un token de Google es válido |
| Prefijo `ROOM-` eliminado al copiar | Los códigos se almacenan con prefijo en la BD pero el inquilino solo pega la parte alfanumérica |
| Zod en formularios (schemas.ts) | `.safeParse()` devuelve `error.issues[0].message` directamente usable en `setErrorDoc` / `setErrorPassword` sin lógica adicional |
| Selector chips DNI/NIE \| Pasaporte | Al cambiar de tipo se limpia el campo y el error — evita validar un DNI con el algoritmo de pasaporte |
