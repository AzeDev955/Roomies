# Setup — Frontend Roomies

## Requisitos

- Node.js 20+
- Expo Go en el móvil (iOS / Android), o un emulador Android/iOS

## Variables de entorno

Copia `frontend/.env.example` a `frontend/.env`. El proyecto soporta tres entornos de API:

| Entorno | URL |
|---|---|
| **Desarrollo** (Railway dev) | `https://roomies-dev.up.railway.app/api` |
| **Producción** (Railway prod) | `https://roomies-production-c884.up.railway.app/api` |
| **Local** (Docker Compose) | `http://<TU_IP>:3001/api` |

```env
# Descomenta el entorno que quieras usar — por defecto: desarrollo en Railway
EXPO_PUBLIC_API_URL=https://roomies-dev.up.railway.app/api

EXPO_PUBLIC_MAPBOX_TOKEN=pk.ey...
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web_client_id>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android_client_id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
```

> `EXPO_PUBLIC_MAPBOX_TOKEN`: necesario para el autocompletado de dirección en "Nueva vivienda". Obtén el tuyo en [account.mapbox.com](https://account.mapbox.com).
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
        [id]/
          _layout.tsx                         # Stack de la vivienda + (tabs) anidado
          nueva-habitacion.tsx                # Crear habitación con autocompletado de nombre
          editar-habitacion.tsx               # Editar habitación + expulsar inquilino + eliminar
          nueva-incidencia.tsx                # Nueva incidencia (vista casero)
          (tabs)/
            _layout.tsx                       # Tab bar vivienda: Resumen | Incidencias | Tablón | Limpieza
            index.tsx                         # Centro de Mando — habitaciones, inquilinos, biometría
            incidencias.tsx                   # Incidencias con soft-tint por prioridad/estado
            tablon.tsx                        # Tablón de la vivienda
            limpieza.tsx                      # Zonas, turnos rotativos y tareas de limpieza
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
      inquilino/
        perfil.styles.ts                      # estilos de casero/inquilino/[id].tsx
      vivienda/
        detalle.styles.ts                     # Centro de Mando (tabs/index.tsx)
        incidencias.styles.ts                 # exports: PRIORIDAD_BG, PRIORIDAD_TEXT, ESTADO_PILL_BG, ESTADO_PILL_TEXT
        limpieza.styles.ts
        nueva-habitacion.styles.ts            # reutilizado también por editar-habitacion.tsx
        nueva-incidencia.styles.ts            # exports: COLORES_PRIORIDAD, ETIQUETAS_PRIORIDAD
    inquilino/
      inicio.styles.ts
      limpieza.styles.ts
      nueva-incidencia.styles.ts              # exports: COLORES_PRIORIDAD, ETIQUETAS_PRIORIDAD
    incidencia/
      detalle.styles.ts                       # exports: PRIORIDAD_BG, PRIORIDAD_TEXT, PRIORIDAD_BORDER, ESTADO_PILL_BG, ESTADO_PILL_TEXT
    tablon/
      tablon.styles.ts                        # compartido por los 3 tablones de tab (casero, casero-vivienda, inquilino)
  constants/
    theme.ts                                  # Design tokens: colors, spacing, radius, typography
```

## Pantallas implementadas

| Ruta                                     | Archivo                                       | Descripción                                                                                                  |
| ---------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/`                                      | `app/index.tsx`                               | Login — POST `/auth/login` + Google OAuth                                                                    |
| `/registro`                              | `app/registro.tsx`                            | Registro — POST `/auth/register` + Google OAuth. Selector chips DNI/NIE \| Pasaporte, validación Zod inline. |
| `/rol`                                   | `app/rol.tsx`                                 | Selector de rol post-OAuth (usuarios nuevos)                                                                 |
| `/perfil`                                | `app/perfil.tsx`                              | GET `/auth/me` + logout                                                                                      |
| `/casero/viviendas`                      | `casero/(tabs)/viviendas.tsx`                 | Lista viviendas del casero                                                                                   |
| `/casero/tablon`                         | `casero/(tabs)/tablon.tsx`                    | Tablón del casero (auto-fetch viviendaId)                                                                    |
| `/casero/perfil`                         | `casero/(tabs)/perfil.tsx`                    | Perfil (tab del casero)                                                                                      |
| `/casero/nueva-vivienda`                 | `casero/nueva-vivienda.tsx`                   | Crear vivienda + habitaciones + Mapbox                                                                       |
| `/casero/vivienda/:id`                   | `casero/vivienda/[id]/(tabs)/index.tsx`       | Centro de Mando — habitaciones, inquilinos, biometría                                                        |
| `/casero/vivienda/:id/incidencias`       | `casero/vivienda/[id]/(tabs)/incidencias.tsx` | Incidencias de la vivienda (tab)                                                                             |
| `/casero/vivienda/:id/tablon`            | `casero/vivienda/[id]/(tabs)/tablon.tsx`      | Tablón de la vivienda (tab)                                                                                  |
| `/casero/vivienda/:id/limpieza`          | `casero/vivienda/[id]/(tabs)/limpieza.tsx`    | Zonas, turnos y tareas de limpieza (tab)                                                                     |
| `/casero/vivienda/:id/nueva-habitacion`  | `casero/vivienda/[id]/nueva-habitacion.tsx`   | Crear habitación con autocompletado de nombre                                                                |
| `/casero/vivienda/:id/editar-habitacion` | `casero/vivienda/[id]/editar-habitacion.tsx`  | Editar habitación + expulsar inquilino + eliminar                                                            |
| `/casero/vivienda/:id/nueva-incidencia`  | `casero/vivienda/[id]/nueva-incidencia.tsx`   | Nueva incidencia desde vista casero                                                                          |
| `/inquilino/inicio`                      | `inquilino/(tabs)/inicio.tsx`                 | Onboarding (canjear código) + Dashboard (compañeros, zonas, incidencias)                                     |
| `/inquilino/limpieza`                    | `inquilino/(tabs)/limpieza.tsx`               | Turno de limpieza del inquilino                                                                              |
| `/inquilino/tablon`                      | `inquilino/(tabs)/tablon.tsx`                 | Tablón del inquilino (auto-fetch viviendaId)                                                                 |
| `/inquilino/perfil`                      | `inquilino/(tabs)/perfil.tsx`                 | Perfil (tab del inquilino)                                                                                   |
| `/inquilino/nueva-incidencia`            | `inquilino/nueva-incidencia.tsx`              | Crear incidencia                                                                                             |
| `/tablon/:viviendaId`                    | `tablon/[viviendaId].tsx`                     | Tablón con viviendaId explícito en URL                                                                       |
| `/incidencia/:id`                        | `incidencia/[id].tsx`                         | Detalle de incidencia                                                                                        |

## Arquitectura de navegación

### Bottom Tab Navigation (Expo Router `(tabs)`)

Cada rol tiene su propio grupo `(tabs)` con tres pestañas:

| Rol               | Pestañas                                  |
| ----------------- | ----------------------------------------- |
| Casero (global)   | Mis viviendas · Tablón · Perfil           |
| Casero (vivienda) | Resumen · Incidencias · Tablón · Limpieza |
| Inquilino         | Mi vivienda · Tablón · Perfil             |

El grupo `(tabs)` es transparente en URLs: `/casero/viviendas` resuelve a `casero/(tabs)/viviendas.tsx`. Las rutas que no son tabs (detalle de vivienda, nueva vivienda, nueva incidencia, detalle de incidencia) se apilan sobre el tab bar gracias al `Stack` en `casero/_layout.tsx` e `inquilino/_layout.tsx`.

### Deep Linking — Custom Scheme `roomies://`

`app.json` define `"scheme": "roomies"`. El sistema operativo intercepta cualquier URL con ese prefijo y abre la app directamente.

El único deep link activo actualmente es el que emite el backend al verificar el correo:

```
roomies://verificacion?status=success
```

`app/index.tsx` escucha este link con `Linking.useURL()`:

```tsx
const url = Linking.useURL();
useEffect(() => {
  if (!url) return;
  const { path, queryParams } = Linking.parse(url);
  if (path === "verificacion" && queryParams?.["status"] === "success") {
    Alert.alert(
      "¡Éxito!",
      "Tu correo ha sido verificado. Ya puedes iniciar sesión.",
    );
  }
}, [url]);
```

> En Expo Go el deep link funciona siempre. En APK nativo (`com.azeron955.roomies`) el sistema registra el scheme durante la instalación — no se necesita configuración adicional de Android.

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
      const { data } = await api.get<{ rol: string }>("/auth/me");
      const destino =
        data.rol === "CASERO" ? "/casero/viviendas" : "/inquilino/inicio";
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

## Sistema de diseño (Épica 9 — "Amigable y Colorido")

### Design tokens (`constants/theme.ts`)

Fuente única de verdad para todos los estilos. Exporta el objeto `Theme` con `as const`:

```typescript
// Colores
Theme.colors.primary; // '#FF6B6B'  — coral cálido (acento principal)
Theme.colors.primaryLight; // '#FFF0F0'  — fondo de focus states
Theme.colors.background; // '#F8F7F4'  — off-white cálido
Theme.colors.surface; // '#FFFFFF'
Theme.colors.surface2; // '#F2F0EB'  — chips y elementos secundarios
Theme.colors.border; // '#E8E6E0'  — borde cálido (2px en inputs y pills)
Theme.colors.success; // '#06D6A0'
Theme.colors.danger; // '#FF4757'
Theme.colors.warning; // '#FFA726'
Theme.colors.textMuted; // '#C4C4D0'  — placeholderTextColor

// Spacing
Theme.spacing.base; // 16
Theme.spacing.xxl; // 48

// Radius
Theme.radius.md; // 16   — inputs, chips
Theme.radius.lg; // 24   — cards, botones, modales
Theme.radius.xl; // 32   — bottom sheets, hero cards
Theme.radius.full; // 100  — pills, avatares

// Tipografía
Theme.typography.body; // 15
Theme.typography.input; // 16
Theme.typography.subtitle; // 18
Theme.typography.heading; // 24
```

### Patrones de diseño establecidos

| Patrón                         | Descripción                                                                                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Focus state en inputs**      | `borderWidth: 2, borderColor: border` en reposo; al recibir foco aplica `inputFocused` con `borderColor: primary + backgroundColor: primaryLight`. Controlado con `useState<string \| null>` + `onFocus`/`onBlur`. |
| **Soft tint pills activos**    | Fondo `primary + '18'` (~10% opacidad), texto y borde `primary`. Inactivo: `backgroundColor: 'transparent'`, `borderColor: border`.                                                                                |
| **Soft tint prioridad/estado** | Mapas semánticos en el `.styles.ts`: `PRIORIDAD_BG`, `PRIORIDAD_TEXT`, `PRIORIDAD_BORDER`. VERDE → `#E5FAF3`/`#0D7A5E`; AMARILLO → `#FFF5E0`/`#A05C00`; ROJO → `#FFE8E8`/`#C0392B`.                                |
| **Botón destructivo suave**    | Fondo `danger + '18'`, borde `danger + '40'` — semántico sin agresividad.                                                                                                                                          |
| **Empty states**               | Caja de icono 80–88px con `borderRadius: xl` + fondo tinted, título bold, subtítulo secundario. CTA solo para rol creador.                                                                                         |
| **Bottom sheet modal**         | `borderTopLeftRadius: xl`, handle bar `40×4px`, backdrop `Pressable rgba(0,0,0,0.4)` para cerrar.                                                                                                                  |
| **Press feedback**             | `opacity` + `transform: [{ scale }]` en Pressables de tarjetas.                                                                                                                                                    |
| **placeholderTextColor**       | Siempre `Theme.colors.textMuted` — nunca hex literal.                                                                                                                                                              |
| **Switch trackColor**          | Siempre `{ false: Theme.colors.border, true: Theme.colors.success }`.                                                                                                                                              |
| **Íconos**                     | Exclusivamente `Ionicons` de `@expo/vector-icons`. Nunca emojis como íconos estructurales.                                                                                                                         |

### Componentes base (`components/common/`)

| Componente     | Props clave                               | Uso                                                                                                                              |
| -------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `CustomButton` | `label`, `variant`, `disabled`, `loading` | Reemplaza todos los `Pressable`-botón con estilos inline. Variantes: `primary` · `secondary` · `outline` · `danger` · `success`. |
| `Card`         | `children`, `onPress?`                    | Contenedor con sombra (`radius.lg`, `elevation: 4`); `Pressable` si recibe `onPress`, `View` si no.                              |
| `CustomInput`  | `label`, `error?`, `secureToggle?`        | Input con label, borde focus/error (`borderWidth: 2`), `minHeight: 52`, toggle de contraseña con Ionicons.                       |

### Validaciones (`utils/`)

| Archivo           | Exports                                                | Descripción                                                                               |
| ----------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `validaciones.ts` | `validarDniNie`, `validarPasaporte`, `validarPassword` | Funciones puras sin dependencias externas. Útiles para lógica fuera de formularios.       |
| `schemas.ts`      | `dniNieSchema`, `pasaporteSchema`, `passwordSchema`    | Esquemas Zod reutilizables. Usar `.safeParse()` para obtener errores tipados con mensaje. |

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
import { styles } from "@/styles/casero/vivienda/detalle.styles";
import { CustomButton } from "@/components/common/CustomButton";
import { Theme } from "@/constants/theme";
import api from "@/services/api";
```

`@/` apunta a la raíz de `frontend/` y está configurado en `tsconfig.json`.

### Recarga automática con `useFocusEffect`

Las pantallas que listan datos usan `useFocusEffect` + `useCallback` para recargar al volver de pantallas de formulario, sin prop drilling ni contexto global.

```tsx
useFocusEffect(
  useCallback(() => {
    cargarDatos();
  }, [id]),
);
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

| Decisión                                                 | Motivo                                                                                                                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Expo Router file-based routing                           | Rutas declarativas por nombre de archivo; estándar moderno de Expo                                                                                                                                |
| Grupo `(tabs)` por rol                                   | Cada rol tiene su propio tab bar sin compartir estado de navegación                                                                                                                               |
| Stack sobre tabs (`casero/_layout`, `inquilino/_layout`) | Pantallas de formulario/detalle se apilan sobre el tab bar sin ocultarlo bruscamente                                                                                                              |
| Guard de sesión en `_layout.tsx`                         | Un solo punto de verificación; ninguna pantalla protegida necesita lógica propia de auth                                                                                                          |
| `router.replace()` en vez de `CommonActions.reset()`     | `CommonActions.reset` usa nombres internos de React Navigation que no resuelven grupos `(tabs)` de Expo Router                                                                                    |
| Design tokens `as const`                                 | TypeScript infiere tipos literales; cambiar un color global requiere editar una sola línea                                                                                                        |
| Componentes base en `components/common/`                 | Elimina ~120 líneas de estilos duplicados; consistencia visual garantizada                                                                                                                        |
| `styles/` fuera de `app/`                                | Expo Router trata todo `app/` como rutas — los `.styles.ts` causarían warnings                                                                                                                    |
| `@/` alias para imports                                  | Evita `../../../../` en rutas anidadas                                                                                                                                                            |
| `Pressable` en lugar de `Button`                         | Mayor control de estilos; `Button` nativo depende de la plataforma                                                                                                                                |
| `expo-secure-store` para el JWT                          | Almacenamiento cifrado en el dispositivo; más seguro que AsyncStorage                                                                                                                             |
| Instancia Axios centralizada                             | Un único punto de configuración del interceptor JWT                                                                                                                                               |
| `useFocusEffect` en lugar de `useEffect`                 | Recarga datos al volver de pantallas de formulario sin estados globales                                                                                                                           |
| Tablón como tab autónomo                                 | Obtiene `viviendaId` vía API en lugar de recibirlo por URL — permite acceso directo desde el tab bar                                                                                              |
| Auth biométrica por habitación                           | Estado `Record<number, boolean>` independiente — revelar un código no afecta al resto                                                                                                             |
| Google OAuth via backend verification                    | El `idToken` siempre se verifica en el servidor — el frontend nunca decide si un token de Google es válido                                                                                        |
| Prefijo `ROOM-` eliminado al copiar                      | Los códigos se almacenan con prefijo en la BD pero el inquilino solo pega la parte alfanumérica                                                                                                   |
| Zod en formularios (schemas.ts)                          | `.safeParse()` devuelve `error.issues[0].message` directamente usable en `setErrorDoc` / `setErrorPassword` sin lógica adicional                                                                  |
| Selector chips DNI/NIE \| Pasaporte                      | Al cambiar de tipo se limpia el campo y el error — evita validar un DNI con el algoritmo de pasaporte                                                                                             |
| Deep link `roomies://` para verificación                 | El backend redirige al scheme propio tras verificar el email — el frontend captura el evento con `Linking.useURL()` sin necesidad de una ruta de Expo Router adicional                            |
| Google OAuth marca `correo_verificado: true`             | Google ya verificó el email — marcar el campo automáticamente evita bloquear a usuarios OAuth en el login                                                                                         |
| Soft tint con hex `+ '18'`                               | Añadir `'18'` al hex de un color produce ~10% de opacidad sin necesidad de `rgba()` — compatible con React Native StyleSheet y mantenible desde los tokens                                        |
| `tablon.styles.ts` compartido                            | Los 3 tablones de tab importan el mismo archivo de estilos — un cambio visual se propaga automáticamente a los tres sin duplicar código                                                           |
| Mapas de color semánticos (`PRIORIDAD_BG`, etc.)         | Exportar objetos `Record<string, string>` desde el `.styles.ts` y aplicarlos inline en JSX permite cambiar la paleta de prioridad/estado en un solo lugar sin lógica condicional en el componente |
| Empty states con Ionicons box                            | El contenedor cuadrado con icono grande y texto alentador (en lugar de texto gris simple) comunica que la pantalla está activa y esperando datos — reduce la percepción de "app rota"             |
| Focus state via `focusedInput` local                     | Un `useState<string \| null>(null)` por pantalla con `onFocus`/`onBlur` en cada `TextInput` es más ligero que un componente wrapper y evita re-renders de toda la pantalla al tipear              |
